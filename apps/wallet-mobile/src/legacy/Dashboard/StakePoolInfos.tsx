import {Balance} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import React from 'react'
import {ActivityIndicator, StyleSheet, View} from 'react-native'
import {useQuery, useQueryClient, UseQueryOptions} from 'react-query'

import {useSelectedWallet} from '../../features/WalletManager/context/SelectedWalletContext'
import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {StakingInfo, YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {Quantities} from '../../yoroi-wallets/utils'
import {StakePoolInfo} from './StakePoolInfo'

export const StakePoolInfos = () => {
  const wallet = useSelectedWallet()
  const {stakePoolIds, isLoading} = useStakePoolIds(wallet)

  return stakePoolIds != null ? (
    <View>
      {stakePoolIds.map((stakePoolId) => (
        <StakePoolInfo key={stakePoolId} stakePoolId={stakePoolId} />
      ))}
    </View>
  ) : isLoading ? (
    <View style={styles.activityIndicator}>
      <ActivityIndicator size="large" color="black" />
    </View>
  ) : null
}

const styles = StyleSheet.create({
  activityIndicator: {
    paddingVertical: 32,
  },
})

export const usePrefetchStakingInfo = (wallet: YoroiWallet) => {
  const queryClient = useQueryClient()

  return () =>
    queryClient.prefetchQuery({
      queryKey: [wallet.id, 'stakingInfo'],
      queryFn: () => wallet.getStakingInfo(),
    })
}

export const useStakingInfo = (
  wallet: YoroiWallet,
  options?: UseQueryOptions<StakingInfo, Error, StakingInfo, [string, 'stakingInfo']>,
) => {
  const query = useQuery({
    ...options,
    retry: false,
    queryKey: [wallet.id, 'stakingInfo'],
    queryFn: () => wallet.getStakingInfo(),
  })

  React.useEffect(() => {
    const unsubscribe = wallet.subscribe(({type}) => type === 'utxos' && query.refetch())

    return () => unsubscribe?.()
  }, [query, wallet])

  return {
    stakingInfo: query.data,
    ...query,
  }
}

export const useStakePoolIds = (
  wallet: YoroiWallet,
  options?: UseQueryOptions<StakingInfo, Error, StakingInfo, [string, 'stakingInfo']>,
) => {
  const {stakingInfo, ...query} = useStakingInfo(wallet, options)

  return {
    ...query,
    stakePoolIds: stakingInfo?.status === 'staked' ? [stakingInfo.poolId] : [],
  }
}

export const useStakingTx = (
  {wallet, poolId}: {wallet: YoroiWallet; poolId?: string},
  options: UseQueryOptions<YoroiUnsignedTx, Error, YoroiUnsignedTx, [string, 'stakingTx']>,
) => {
  const query = useQuery({
    ...options,
    queryKey: [wallet.id, 'stakingTx'],
    queryFn: async () => {
      if (poolId == null) throw new Error('invalid state')
      const accountStates = await wallet.fetchAccountState()
      const accountState = accountStates[wallet.rewardAddressHex]
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!accountState) throw new Error('Account state not found')

      const stakingUtxos = await wallet.getAllUtxosForKey()
      const amountToDelegate = Quantities.sum([
        ...stakingUtxos.map((utxo) => utxo.amount as Balance.Quantity),
        accountState.remainingAmount as Balance.Quantity,
      ])

      return wallet.createDelegationTx(poolId, new BigNumber(amountToDelegate))
    },
    enabled: poolId != null,
  })

  return {
    ...query,
    stakingTx: query.data,
  }
}
