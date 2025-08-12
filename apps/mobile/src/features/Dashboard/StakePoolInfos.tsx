import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseSuspenseQueryOptions,
} from '@tanstack/react-query'
import {useTheme} from '@yoroi/theme'
import {Balance, Wallet} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {ActivityIndicator, View} from 'react-native'

import {useStakingInfo} from '~/features/Staking/hooks/useStakingInfo'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {ButtonProps} from '~/ui/Button/Button'
import {YoroiWallet} from '~/wallets/cardano/types'
import {StakingInfo} from '~/wallets/types/staking'
import {YoroiUnsignedTx} from '~/wallets/types/yoroi'
import {Quantities} from '~/wallets/utils/utils'

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

export const useStakingTx = (
  {
    wallet,
    meta,
    poolId,
  }: {wallet: YoroiWallet; poolId?: string; meta: Wallet.Meta},
  options: UseQueryOptions<
    YoroiUnsignedTx,
    Error,
    YoroiUnsignedTx,
    [string, 'stakingTx']
  >,
) => {
  const query = useQuery({
    ...options,
    retry: false,
    queryKey: [wallet.id, 'stakingTx'],
    queryFn: async () => {
      if (poolId == null) throw new Error('invalid state')
      const accountStates = await wallet.fetchAccountState()
      const accountState = accountStates[wallet.rewardAddressHex]
      if (!accountState) throw new Error('Account state not found')

      const stakingUtxos = await wallet.getAllUtxosForKey()
      const amountToDelegate = Quantities.sum([
        ...stakingUtxos.map((utxo) => utxo.amount as Balance.Quantity),
        accountState.remainingAmount as Balance.Quantity,
      ])

      return wallet.createDelegationTx({
        poolId,
        delegatedAmount: new BigNumber(amountToDelegate),
        addressMode: meta.addressMode,
      })
    },
    enabled: poolId != null,
  })

  return {
    ...query,
    stakingTx: query.data,
  }
}
