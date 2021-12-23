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

export const useStakingStatus = (wallet: WalletInterface) => {
  const query = useQuery({
    queryKey: [wallet.id, 'stakingStatus'],
    queryFn: () => wallet.getDelegationStatus(),
  })

  return {stakingStatus: query.data, ...query}
}

export const useStakePoolIds = (wallet: WalletInterface) => {
  const {stakingStatus, ...stakingStatusQuery} = useStakingStatus(wallet)

  return {
    ...stakingStatusQuery,
    stakePoolIds: stakingStatus?.poolKeyHash ? [stakingStatus.poolKeyHash] : undefined,
  }
}
