import {StakingInfo} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'

import {UseSuspenseQueryOptions, useQueryClient} from '@tanstack/react-query'
import * as React from 'react'
import {ActivityIndicator, View} from 'react-native'

import {useStakingInfo} from '~/features/Staking/hooks/useStakingInfo'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'
import {ButtonProps} from '~/ui/Button/Button'
import {YoroiWallet} from '@yoroi/cardano-wallet/types'

import {StakePoolInfo} from './StakePoolInfo'

export const StakePoolInfos = ({ctaProps}: {ctaProps?: ButtonProps}) => {
  const {wallet} = useSelectedWallet()
  const {stakePoolIds, isLoading} = useStakePoolIds(wallet)
  const {isDark} = useTheme()

  return stakePoolIds != null ? (
    <View>
      {stakePoolIds.map((stakePoolId) => (
        <StakePoolInfo
          key={stakePoolId}
          stakePoolId={stakePoolId}
          ctaProps={ctaProps}
        />
      ))}
    </View>
  ) : isLoading ? (
    <View style={[{paddingVertical: 32}]}>
      <ActivityIndicator size="large" color={isDark ? 'white' : 'black'} />
    </View>
  ) : null
}

export const usePrefetchStakingInfo = (wallet: YoroiWallet) => {
  const queryClient = useQueryClient()

  return () =>
    queryClient.prefetchQuery({
      queryKey: [wallet.id, 'useStakingInfo'],
      queryFn: () => wallet.getStakingInfo(),
    })
}

const useStakePoolIds = (
  wallet: YoroiWallet,
  options?: UseSuspenseQueryOptions<
    StakingInfo,
    Error,
    StakingInfo,
    [string, 'useStakingInfo']
  >,
) => {
  const {stakingInfo, ...query} = useStakingInfo(wallet, options)

  return {
    ...query,
    stakePoolIds: stakingInfo?.status === 'staked' ? [stakingInfo.poolId] : [],
  }
}
