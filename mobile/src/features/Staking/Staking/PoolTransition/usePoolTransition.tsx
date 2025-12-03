import {API_ENDPOINTS} from '@yoroi/api'
import {poolInfoApiMaker} from '@yoroi/staking'
import {Wallet} from '@yoroi/types'

import {init} from '@emurgo/cross-csl-mobile'
import {useQuery} from '@tanstack/react-query'
import * as React from 'react'

import {useNavigateTo} from '~/features/Staking/Governance/common/navigation'
import {isInsufficientBalanceError} from '~/features/Staking/Governance/common/transactionErrorHandling'
import {useStakingInfo} from '~/features/Staking/hooks/useStakingInfo'
import {useSelectedNetwork} from '@yoroi/wallet-manager/hooks/useSelectedNetwork'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'
import {features} from '~/kernel/features'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {createDelegationTxFromWallet} from '@yoroi/cardano-wallet/transaction-recipes'
import {YoroiWallet} from '@yoroi/cardano-wallet/types'

const createDelegationTxHelper = async (
  wallet: YoroiWallet,
  poolId: string,
  meta: Wallet.Meta,
) => {
  const accountStates = await wallet.fetchAccountState()
  const accountState = accountStates[wallet.rewardAddressHex]
  if (!accountState) throw new Error('Account state not found')

  return createDelegationTxFromWallet(wallet, {
    poolId,
    addressMode: meta.addressMode,
  })
}

export const usePoolTransition = () => {
  const {wallet, meta} = useSelectedWallet()
  const {networkManager} = useSelectedNetwork()
  const {navigateToTxReview} = useWalletNavigation()
  const navigateTo = useNavigateTo()
  const {stakingInfo, isLoading} = useStakingInfo(wallet)

  const poolInfoApi = React.useMemo(() => {
    return poolInfoApiMaker({
      legacyApiBaseUrl: networkManager.legacyApiBaseUrl,
      zeroApiUrl: API_ENDPOINTS[networkManager.network].root,
    })
  }, [networkManager.legacyApiBaseUrl, networkManager.network])

  const isStaked = stakingInfo?.status === 'staked'
  const currentPoolId = isStaked ? stakingInfo?.poolId : ''

  const poolTransitionQuery = useQuery({
    enabled: isStaked,
    retry: false,
    staleTime: Infinity,
    queryKey: [wallet.id, 'poolTransition', currentPoolId],
    queryFn: () => {
      return features.poolTransition
        ? poolInfoApi.getTransition(currentPoolId, init)
        : null
    },
  })

  const poolTransition = poolTransitionQuery.data ?? null
  const poolId = poolTransition?.suggested.hash ?? ''

  const navigateToUpdate = React.useCallback(async () => {
    try {
      const result = await createDelegationTxHelper(wallet, poolId, meta)
      navigateToTxReview({cbor: result.cbor, context: 'delegate'})
    } catch (error) {
      // Check if error is due to insufficient balance and navigate to noFunds screen
      if (isInsufficientBalanceError(error)) {
        navigateTo.noFunds()
        return
      }
      throw error
    }
  }, [wallet, poolId, meta, navigateToTxReview, navigateTo])

  if (isLoading) {
    return {
      isPoolRetiring: false,
      isLoading: true,
      poolTransition: null,
      navigateToUpdate: () => Promise.resolve(),
      data: null,
      error: null,
      refetch: () => poolTransitionQuery.refetch(),
    }
  }

  return {
    ...poolTransitionQuery,
    isLoading: isLoading || poolTransitionQuery.isLoading,
    poolTransition,
    isPoolRetiring: poolTransition !== null,
    navigateToUpdate,
  }
}
