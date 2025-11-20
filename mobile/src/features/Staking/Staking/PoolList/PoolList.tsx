import {ExplorerPoolInfo} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'

import {FlashList} from '@shopify/flash-list'
import {Image} from 'expo-image'
import * as React from 'react'
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native'

import {useDebouncedValue} from '@yoroi/common'
import {useSearch} from '~/features/Search/SearchContext'
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
  const {search, setLoading} = useSearch()

  // Debounce search input to avoid excessive API calls
  const debouncedSearch = useDebouncedValue(search, 200)

  // Compute search query from debounced search
  const searchQuery = debouncedSearch.trim() || undefined

  const {pools, isLoading, error, loadMore, hasMore, isFetchingMore} =
    usePoolList(searchQuery)

  // Sync loading state with search context
  React.useEffect(() => {
    // Only show loading spinner when actively searching (not initial load)
    const isSearching = searchQuery !== undefined && searchQuery.length > 0
    setLoading(isSearching && isLoading)
  }, [isLoading, searchQuery, setLoading])

  // Prefetch next page when we're 70% through the list
  const handleEndReached = React.useCallback(() => {
    if (hasMore && !isFetchingMore) {
      loadMore()
    }
  }, [hasMore, isFetchingMore, loadMore])

  // Memoize renderItem to prevent recreating on every render
  const renderItem = React.useCallback(
    ({item}: {item: ExplorerPoolInfo}) => (
      <PoolCard pool={item} onPress={() => onPoolSelect(item.hash)} />
    ),
    [onPoolSelect],
  )

  // Memoize keyExtractor
  const keyExtractor = React.useCallback(
    (item: ExplorerPoolInfo) => item.hash,
    [],
  )

  // Memoize footer component (must be before early returns)
  const footerComponent = React.useMemo(
    () =>
      isFetchingMore ? (
        <View style={[a.p_lg, a.align_center]}>
          <ActivityIndicator size="small" color={p.el_primary_medium} />
        </View>
      ) : null,
    [isFetchingMore, p.el_primary_medium],
  )

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
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        keyExtractor={keyExtractor}
        contentContainerStyle={a.p_lg}
        estimatedItemSize={120}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.7}
        drawDistance={500}
        removeClippedSubviews={true}
        ListFooterComponent={footerComponent}
      />
    </View>
  )
}

const ItemSeparator = React.memo(() => <Space.Height.md />)
ItemSeparator.displayName = 'ItemSeparator'

type PoolCardProps = {
  pool: ExplorerPoolInfo
  onPress: () => void
}

const PoolCard = React.memo(({pool, onPress}: PoolCardProps) => {
  const {wallet} = useSelectedWallet()
  const {atoms: ta, palette: p} = useTheme()

  // Memoize pool name calculation
  const poolName = React.useMemo(
    () =>
      pool.name && pool.ticker
        ? `${pool.name} [${pool.ticker}]`
        : pool.name || pool.ticker || 'Unknown Pool',
    [pool.name, pool.ticker],
  )

  // Memoize formatted stake value
  const formattedStake = React.useMemo(() => {
    if (!pool.stake) return null

    try {
      // Validate that stake is a valid number string before calling asQuantity
      const stakeNum = Number(pool.stake)
      if (isNaN(stakeNum) || !isFinite(stakeNum) || stakeNum <= 0) {
        return null
      }

      return formatTokenWithText(
        asQuantity(pool.stake),
        wallet.portfolioPrimaryTokenInfo,
      )
    } catch {
      // If asQuantity throws, return null to gracefully handle invalid values
      return null
    }
  }, [pool.stake, wallet.portfolioPrimaryTokenInfo])

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
            cachePolicy="memory-disk"
            contentFit="cover"
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

            {formattedStake && (
              <PoolStat label="Stake" value={formattedStake} />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
})
PoolCard.displayName = 'PoolCard'

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
