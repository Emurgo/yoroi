import {init} from '@emurgo/cross-csl-mobile'
import {PoolInfoApi} from '@emurgo/yoroi-lib'
import {useQuery} from '@tanstack/react-query'
import {Wallet} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import * as React from 'react'

import {useStakingInfo} from '~/features/Dashboard/StakePoolInfos'
import {useReviewTx} from '~/features/ReviewTx/common/ReviewTxProvider'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {features} from '~/kernel/features'
import {useWalletNavigation} from '~/kernel/navigation/hooks'
import {YoroiWallet} from '~/wallets/cardano/types'
import {asQuantity, Quantities} from '~/wallets/utils/utils'

const createDelegationTx = async (
  wallet: YoroiWallet,
  poolId: string,
  meta: Wallet.Meta,
) => {
  const accountStates = await wallet.fetchAccountState()
  const accountState = accountStates[wallet.rewardAddressHex]
  if (!accountState) throw new Error('Account state not found')

  const stakingUtxos = await wallet.getAllUtxosForKey()
  const amountToDelegate = Quantities.sum([
    ...stakingUtxos.map((utxo) => asQuantity(utxo.amount)),
    asQuantity(accountState.remainingAmount),
  ])

  return wallet.createDelegationTx({
    poolId,
    delegatedAmount: new BigNumber(amountToDelegate),
    addressMode: meta.addressMode,
  })
}

export const usePoolTransition = () => {
  const {wallet, meta} = useSelectedWallet()
  const {networkManager} = useSelectedNetwork()
  const {navigateToTxReview} = useWalletNavigation()
  const {unsignedTxChanged} = useReviewTx()
  const {stakingInfo, isLoading} = useStakingInfo(wallet)
  const poolInfoApi = React.useMemo(
    () => new PoolInfoApi(networkManager.legacyApiBaseUrl),
    [networkManager.legacyApiBaseUrl],
  )

  const isStaked = stakingInfo?.status === 'staked'
  const currentPoolId = isStaked ? stakingInfo?.poolId : ''

  const poolTransitionQuery = useQuery({
    enabled: isStaked,
    retry: false,
    staleTime: Infinity,
    queryKey: [wallet.id, 'poolTransition', currentPoolId],
    queryFn: () =>
      features.poolTransition
        ? poolInfoApi.getTransition(currentPoolId, init)
        : null,
  })

  const poolTransition = poolTransitionQuery.data ?? null
  const poolId = poolTransition?.suggested.hash ?? ''

  const navigateToUpdate = React.useCallback(async () => {
    const yoroiUnsignedTx = await createDelegationTx(wallet, poolId, meta)
    unsignedTxChanged(yoroiUnsignedTx)
    navigateToTxReview()
  }, [wallet, poolId, meta, unsignedTxChanged, navigateToTxReview])

  return {
    ...poolTransitionQuery,
    isLoading: isLoading || poolTransitionQuery.isLoading,
    poolTransition,
    isPoolRetiring: poolTransition !== null,
    navigateToUpdate,
  }
}
