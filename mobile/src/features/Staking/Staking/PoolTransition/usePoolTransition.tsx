import {PoolInfoApi} from '@yoroi/staking'
import {Wallet} from '@yoroi/types'

import {init} from '@emurgo/cross-csl-mobile'
import {useQuery} from '@tanstack/react-query'
import * as React from 'react'

import {useStakingInfo} from '~/features/Staking/hooks/useStakingInfo'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {features} from '~/kernel/features'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {createDelegationTxFromWallet} from '~/wallets/cardano/transaction-recipes'
import {YoroiWallet} from '~/wallets/cardano/types'

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
  const {stakingInfo, isLoading} = useStakingInfo(wallet)

  const poolInfoApi = React.useMemo(() => {
    return new PoolInfoApi(networkManager.legacyApiBaseUrl)
  }, [networkManager.legacyApiBaseUrl])

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
    const result = await createDelegationTxHelper(wallet, poolId, meta)
    navigateToTxReview({cbor: result.cbor, context: 'delegate'})
  }, [wallet, poolId, meta, navigateToTxReview])

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
