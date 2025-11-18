import {ExplorerPoolInfo} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'

import {FlashList} from '@shopify/flash-list'
import {Image} from 'expo-image'
import * as React from 'react'
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {Space} from '~/ui/Space/Space'
import {formatTokenWithText} from '~/wallets/utils/format'
import {asQuantity} from '~/wallets/utils/utils'

import {usePoolList} from './usePoolList'

type PoolListProps = {
  onPoolSelect: (poolHash: string) => void
}

export const PoolList = ({onPoolSelect}: PoolListProps) => {
  const {atoms: ta, palette: p} = useTheme()
  const {pools, isLoading, error, loadMore, hasMore} = usePoolList()

  if (isLoading && pools.length === 0) {
    return (
      <View style={[a.flex_1, a.justify_center, a.align_center]}>
        <ActivityIndicator size="large" color={p.el_primary_medium} />
      </View>
    )
  }

  if (error && pools.length === 0) {
    return (
      <View style={[a.flex_1, a.justify_center, a.align_center, a.p_lg]}>
        <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
          {'Failed to load pools'}
        </Text>
      </View>
    )
  }

  return (
    <View style={[a.flex_1]}>
      <FlashList
        data={pools}
        renderItem={({item}) => (
          <PoolCard pool={item} onPress={() => onPoolSelect(item.hash)} />
        )}
        ItemSeparatorComponent={() => <Space.Height.md />}
        keyExtractor={(item) => item.hash}
        contentContainerStyle={a.p_lg}
        estimatedItemSize={120}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading && pools.length > 0 ? (
            <View style={[a.p_lg, a.align_center]}>
              <ActivityIndicator size="small" color={p.el_primary_medium} />
            </View>
          ) : null
        }
      />
    </View>
  )
}

type PoolCardProps = {
  pool: ExplorerPoolInfo
  onPress: () => void
}

const PoolCard = ({pool, onPress}: PoolCardProps) => {
  const {wallet} = useSelectedWallet()
  const {atoms: ta, palette: p} = useTheme()
  const poolName =
    pool.name && pool.ticker
      ? `${pool.name} [${pool.ticker}]`
      : pool.name || pool.ticker || 'Unknown Pool'

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        a.p_lg,
        ta.bg_color_min,
        {
          borderRadius: 8,
          borderWidth: 1,
          borderColor: p.gray_200,
        },
      ]}
    >
      <View style={[a.flex_row, a.gap_md, a.align_center]}>
        {pool.pic && (
          <Image
            source={{uri: pool.pic}}
            style={[{width: 48, height: 48, borderRadius: 24}]}
          />
        )}

        <View style={[a.flex_1, a.gap_xs]}>
          <Text
            style={[a.body_1_lg_medium, ta.text_gray_max]}
            numberOfLines={1}
          >
            {poolName}
          </Text>

          <View style={[a.flex_row, a.gap_md, a.flex_wrap]}>
            {pool.roa && (
              <PoolStat label="ROA" value={`${Number(pool.roa).toFixed(2)}%`} />
            )}

            {pool.saturation && (
              <PoolStat
                label="Saturation"
                value={`${Number(pool.saturation).toFixed(1)}%`}
              />
            )}

            {pool.stake && (
              <PoolStat
                label="Stake"
                value={formatTokenWithText(
                  asQuantity(pool.stake),
                  wallet.portfolioPrimaryTokenInfo,
                )}
              />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

type PoolStatProps = {
  label: string
  value: string
}

const PoolStat = ({label, value}: PoolStatProps) => {
  const {atoms: ta} = useTheme()

  return (
    <View>
      <Text style={[a.body_3_sm_regular, ta.text_gray_low]}>{label}</Text>
      <Text style={[a.body_2_md_medium, ta.text_gray_medium]}>{value}</Text>
    </View>
  )
}
