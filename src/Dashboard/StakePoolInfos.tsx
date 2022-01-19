import BigNumber from 'bignumber.js'
import React from 'react'
import {ActivityIndicator, StyleSheet, View} from 'react-native'
import {useQuery} from 'react-query'

import {useSelectedWallet} from '../SelectedWallet'
import {WalletInterface} from '../types'
import {StakePoolInfo} from './StakePoolInfo'

export const StakePoolInfos = () => {
  const wallet = useSelectedWallet()
  const {stakePoolIds, isLoading} = useStakePoolIds(wallet)

  return stakePoolIds ? (
    <View>
      {stakePoolIds.map((stakePoolId) => (
        <StakePoolInfo key={stakePoolId} stakePoolId={stakePoolId} />
      ))}
    </View>
  ) : isLoading ? (
    <View style={styles.activityIndicator}>
      <ActivityIndicator size={'large'} color={'black'} />
    </View>
  ) : null
}

const styles = StyleSheet.create({
  activityIndicator: {
    paddingVertical: 32,
  },
})

type StakingInfo = Registered | NotRegistered
type Registered = {
  isRegistered: true
  poolId: string
  amount: string
  rewards: string
}
type NotRegistered = {
  isRegistered: false
}

export const useStakingInfo = (wallet: WalletInterface) => {
  const query = useQuery<StakingInfo>({
    onError: (error) => console.log('QWE', error),
    retry: false,
    queryKey: [wallet.id, 'stakingInfo'],
    queryFn: async () => {
      const stakingStatus = await wallet.getDelegationStatus()
      if (!stakingStatus.isRegistered) return {isRegistered: false}

      const accountStates = await wallet.fetchAccountState()
      const accountState = accountStates[wallet.rewardAddressHex]
      if (!accountState) throw new Error('Account state not found')

      const utxos = await wallet.fetchUTXOs()
      const stakingUtxos = await wallet.getAllUtxosForKey(utxos)
      const amount = sum([...stakingUtxos.map((utxo) => utxo.amount), accountState.remainingAmount])

      return {
        isRegistered: true,
        poolId: stakingStatus.poolKeyHash,
        amount,
        rewards: accountState.remainingAmount,
      }
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

export const useStakePoolIds = (wallet: WalletInterface) => {
  const {stakingInfo, ...stakingInfoQuery} = useStakingInfo(wallet)

  return {
    ...stakingInfoQuery,
    stakePoolIds: !stakingInfo ? undefined : stakingInfo.isRegistered ? [stakingInfo.poolId] : [],
  }
}

const sum = (numbers: Array<string>) => numbers.reduce((x: BigNumber, y) => x.plus(y), new BigNumber(0)).toString()
