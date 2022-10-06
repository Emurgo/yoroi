import BigNumber from 'bignumber.js'
import React from 'react'
import {ActivityIndicator, StyleSheet, View} from 'react-native'
import {useQuery, UseQueryOptions} from 'react-query'

import {getDefaultAssetByNetworkId} from '../legacy/config'
import {useSelectedWallet} from '../SelectedWallet'
import {YoroiWallet} from '../yoroi-wallets'
import {YoroiUnsignedTx} from '../yoroi-wallets/types'
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

type StakingInfo = Registered | Staked | NotRegistered
type NotRegistered = {
  status: 'not-registered'
}
type Registered = {
  status: 'registered'
}
type Staked = {
  status: 'staked'
  poolId: string
  amount: string
  rewards: string
}

export const useStakingInfo = (
  wallet: YoroiWallet,
  options?: UseQueryOptions<StakingInfo, Error, StakingInfo, [string, string]>,
) => {
  const query = useQuery({
    ...options,
    retry: false,
    queryKey: [wallet.id, 'stakingInfo'],
    queryFn: async () => {
      const stakingStatus = await wallet.getDelegationStatus()
      if (!stakingStatus.isRegistered) return {status: 'not-registered'} as NotRegistered
      if (!('poolKeyHash' in stakingStatus)) return {status: 'registered'} as Registered

      const accountStates = await wallet.fetchAccountState()
      const accountState = accountStates[wallet.rewardAddressHex]
      if (!accountState) throw new Error('Account state not found')

      const utxos = await wallet.fetchUTXOs()
      const stakingUtxos = await wallet.getAllUtxosForKey(utxos)
      const amount = sum([...stakingUtxos.map((utxo) => utxo.amount), accountState.remainingAmount])

      return {
        status: 'staked',
        poolId: stakingStatus.poolKeyHash,
        amount,
        rewards: accountState.remainingAmount,
      } as Staked
    },
  })

  React.useEffect(() => {
    wallet.subscribeOnTxHistoryUpdate(() => {
      setTimeout(() => query.refetch(), 1000)
    }) // refetch on new transactions

    // currently no way to unsubscribe from wallet events
  }, [query, wallet])

  return {
    stakingInfo: query.data,
    ...query,
  }
}

export const useStakePoolIds = (
  wallet: YoroiWallet,
  options?: UseQueryOptions<StakingInfo, Error, StakingInfo, [string, string]>,
) => {
  const {stakingInfo, ...query} = useStakingInfo(wallet, options)

  return {
    ...query,
    stakePoolIds: stakingInfo?.status === 'staked' ? [stakingInfo.poolId] : [],
  }
}

const sum = (numbers: Array<string>) => numbers.reduce((x: BigNumber, y) => x.plus(y), new BigNumber(0)).toString()

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
      if (!accountState) throw new Error('Account state not found')

      const utxos = await wallet.fetchUTXOs()
      const stakingUtxos = await wallet.getAllUtxosForKey(utxos)
      const amountToDelegate = sum([...stakingUtxos.map((utxo) => utxo.amount), accountState.remainingAmount])

      return wallet.createDelegationTx(
        poolId,
        new BigNumber(amountToDelegate),
        utxos,
        getDefaultAssetByNetworkId(wallet.networkId),
      )
    },
    enabled: poolId != null,
  })

  return {
    ...query,
    stakingTx: query.data,
  }
}
