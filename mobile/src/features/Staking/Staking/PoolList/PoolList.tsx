import {useDebouncedValue} from '@yoroi/common'
import {ExplorerPoolInfo} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'

import {FlashList} from '@shopify/flash-list'
import {Image} from 'expo-image'
import * as React from 'react'
import {
  ActivityIndicator,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

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

  const {pools, isLoading, error} = usePoolList(searchQuery)

  // Sync loading state with search context
  React.useEffect(() => {
    // Only show loading spinner when actively searching (not initial load)
    const isSearching = searchQuery !== undefined && searchQuery.length > 0
    setLoading(isSearching && isLoading)
  }, [isLoading, searchQuery, setLoading])

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

  // Memoize footer component
  const footerComponent = React.useMemo(() => <PoweredByFooter />, [])

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

const PoweredByFooter = React.memo(() => {
  const {atoms: ta} = useTheme()
  const cexplorerLogoUri =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ2IiBoZWlnaHQ9IjQxIiB2aWV3Qm94PSIwIDAgMTQ2IDQxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBmaWx0ZXI9InVybCgjZmlsdGVyMF9kZF8xODk0XzQ4NTA4MykiPgo8cGF0aCBkPSJNMTguOTkwMiAzMy4yMjYxQzE2LjEwNDggMzMuMjI2MSAxMy4yODQxIDMyLjM3MDUgMTAuODg1IDMwLjc2NzRDOC40ODU4IDI5LjE2NDQgNi42MTU4OSAyNi44ODU5IDUuNTExNjcgMjQuMjIwMUM0LjQwNzQ2IDIxLjU1NDMgNC4xMTg1NSAxOC42MjA5IDQuNjgxNDcgMTUuNzkwOUM1LjI0NDM5IDEyLjk2MDkgNi42MzM4NyAxMC4zNjEzIDguNjc0MTkgOC4zMjEwMkMxMC43MTQ1IDYuMjgwNyAxMy4zMTQgNC44OTEyMyAxNi4xNDQgNC4zMjgzMUMxOC45NzQgMy43NjUzOCAyMS45MDc0IDQuMDU0MjkgMjQuNTczMiA1LjE1ODUxQzI3LjIzOSA2LjI2MjcyIDI5LjUxNzUgOC4xMzI2NCAzMS4xMjA2IDEwLjUzMThDMzIuNzIzNyAxMi45MzEgMzMuNTc5MyAxNS43NTE2IDMzLjU3OTMgMTguNjM3MUMzMy41NzkzIDIyLjUwNjMgMzIuMDQyMyAyNi4yMTcxIDI5LjMwNjMgMjguOTUzMUMyNi41NzAzIDMxLjY4OTEgMjIuODU5NSAzMy4yMjYxIDE4Ljk5MDIgMzMuMjI2MVoiIGZpbGw9IiNFNDAwM0EiLz4KPHBhdGggZD0iTTEyLjYyIDI1LjgwOUwxOC45MzA2IDEwLjk1MzJaIiBmaWxsPSIjMDUwMDAxIi8+CjxwYXRoIGQ9Ik0xMi42MiAyNS44MDlMMTguOTMwNiAxMC45NTMyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuMTgiIHN0cm9rZS1taXRlcmxpbWl0PSIzLjciIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNMjUuNDExOCAyNS44MDU1TDE5LjEwNjIgMTAuOTVaIiBmaWxsPSIjMDUwMDAxIi8+CjxwYXRoIGQ9Ik0yNS40MTE4IDI1LjgwNTVMMTkuMTA2MiAxMC45NSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxLjE4IiBzdHJva2UtbWl0ZXJsaW1pdD0iMy43IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTE0LjAzMDEgMTcuMzE3OEwyMy45NzE3IDE3LjI4NzlaIiBmaWxsPSIjMDUwMDAxIi8+CjxwYXRoIGQ9Ik0xNC4wMzAxIDE3LjMxNzhMMjMuOTcxNyAxNy4yODc5IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuMTgiIHN0cm9rZS1taXRlcmxpbWl0PSIzLjciIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTIuNzUxOSAyMC4yMDQ1TDI1LjI0ODEgMjAuMTgwNloiIGZpbGw9IiMwNTAwMDEiLz4KPHBhdGggZD0iTTEyLjc1MTkgMjAuMjA0NUwyNS4yNDgxIDIwLjE4MDYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS4xOCIgc3Ryb2tlLW1pdGVybGltaXQ9IjMuNyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjwvZz4KPHBhdGggZD0iTTQyLjAxNTQgMTkuMTU3QzQyLjAxNTQgMTUuODMzOSA0NC40NzY5IDEzLjI0OTMgNDcuOTIzMSAxMy4yNDkzQzUwLjI2MTUgMTMuMjQ5MyA1MS43Mzg1IDE0LjIzMzkgNTIuNzIzMSAxNS41ODc3TDUwLjM4NDYgMTcuNDMzOUM0OS43NjkyIDE2LjU3MjMgNDkuMDMwOCAxNi4wOCA0Ny45MjMxIDE2LjA4QzQ2LjMyMzEgMTYuMDggNDUuMjE1NCAxNy40MzM5IDQ1LjIxNTQgMTkuMDMzOUM0NS4yMTU0IDIwLjc1NyA0Ni4zMjMxIDIxLjk4NzcgNDcuOTIzMSAyMS45ODc3QzQ5LjAzMDggMjEuOTg3NyA0OS43NjkyIDIxLjQ5NTQgNTAuNTA3NyAyMC42MzM5TDUyLjg0NjEgMjIuMzU3QzUxLjczODUgMjMuODMzOSA1MC4zODQ2IDI0Ljk0MTYgNDcuOTIzMSAyNC45NDE2QzQ0LjYgMjQuOTQxNiA0Mi4wMTU0IDIyLjQ4IDQyLjAxNTQgMTkuMTU3WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTU0LjA3NjkgMjAuNTEwOEM1NC4wNzY5IDE4LjA0OTIgNTUuOCAxNi4wOCA1OC4yNjE1IDE2LjA4QzYwLjk2OTIgMTYuMDggNjIuMzIzMSAxOC4xNzIzIDYyLjMyMzEgMjAuNjMzOUM2Mi4zMjMxIDIwLjc1NjkgNjIuMzIzMSAyMS4wMDMxIDYyLjMyMzEgMjEuMTI2Mkg1Ni4xNjkyQzU2LjQxNTQgMjIuNDggNTcuNCAyMy4yMTg1IDU4LjYzMDggMjMuMjE4NUM1OS42MTU0IDIzLjIxODUgNjAuMjMwOCAyMi44NDkyIDYwLjk2OTIgMjIuMjMzOUw2Mi4wNzY5IDIzLjIxODVDNjEuMjE1NCAyNC4yMDMxIDYwLjIzMDggMjQuODE4NSA1OC42MzA4IDI0LjgxODVDNTUuOTIzMSAyNC45NDE2IDU0LjA3NjkgMjMuMjE4NSA1NC4wNzY5IDIwLjUxMDhaTTYwLjM1MzggMTkuODk1NEM2MC4yMzA4IDE4LjY2NDYgNTkuNDkyMyAxNy42OCA1OC4yNjE1IDE3LjY4QzU3LjAzMDggMTcuNjggNTYuMjkyMyAxOC41NDE2IDU2LjA0NjIgMTkuODk1NEg2MC4zNTM4WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTY2LjAxNTQgMjAuNTEwOEw2My4wNjE1IDE2LjMyNjJINjUuMTUzOEw2Ny4xMjMxIDE5LjE1NjlMNjkuMDkyMyAxNi4zMjYySDcxLjE4NDZMNjguMjMwOCAyMC4zODc3TDcxLjMwNzcgMjQuNjk1NEg2OS4yMTU0TDY3LjEyMzEgMjEuNzQxNkw2NS4wMzA4IDI0LjY5NTRINjIuOTM4NUw2Ni4wMTU0IDIwLjUxMDhaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNzMuMDMwOCAxNi4zMjYySDc1VjE3LjY4Qzc1LjYxNTQgMTYuODE4NSA3Ni40NzY5IDE2LjA4IDc3LjgzMDggMTYuMDhDNzkuOCAxNi4wOCA4MS43NjkyIDE3LjY4IDgxLjc2OTIgMjAuNTEwOEM4MS43NjkyIDIzLjM0MTYgNzkuOCAyNC45NDE2IDc3LjgzMDggMjQuOTQxNkM3Ni40NzY5IDI0Ljk0MTYgNzUuNjE1NCAyNC4yMDMxIDc1IDIzLjQ2NDZWMjcuMjhINzMuMDMwOFYxNi4zMjYyWk03OS44IDIwLjUxMDhDNzkuOCAxOC43ODc3IDc4LjY5MjMgMTcuODAzMSA3Ny4zMzg1IDE3LjgwMzFDNzUuOTg0NiAxNy44MDMxIDc0Ljg3NjkgMTguOTEwOCA3NC44NzY5IDIwLjUxMDhDNzQuODc2OSAyMi4xMTA4IDc1Ljk4NDYgMjMuMjE4NSA3Ny4zMzg1IDIzLjIxODVDNzguNjkyMyAyMy4yMTg1IDc5LjggMjIuMjMzOSA3OS44IDIwLjUxMDhaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNODMuODYxNSAxMy4xMjYySDg1LjgzMDhWMjQuODE4NUg4My44NjE1VjEzLjEyNjJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNODcuOCAyMC42MzM5Qzg3LjggMTguMTcyNCA4OS43NjkyIDE2LjIwMzEgOTIuMzUzOCAxNi4yMDMxQzk0LjkzODQgMTYuMjAzMSA5Ni45MDc3IDE4LjE3MjQgOTYuOTA3NyAyMC42MzM5Qzk2LjkwNzcgMjMuMDk1NCA5NC45Mzg0IDI1LjA2NDcgOTIuMzUzOCAyNS4wNjQ3Qzg5Ljc2OTIgMjQuOTQxNiA4Ny44IDIyLjk3MjQgODcuOCAyMC42MzM5Wk05NC45Mzg0IDIwLjYzMzlDOTQuOTM4NCAxOS4xNTcgOTMuODMwOCAxNy45MjYyIDkyLjM1MzggMTcuOTI2MkM5MC43NTM4IDE3LjkyNjIgODkuNzY5MiAxOS4xNTcgODkuNzY5MiAyMC42MzM5Qzg5Ljc2OTIgMjIuMTEwOCA5MC44NzY5IDIzLjM0MTYgOTIuMzUzOCAyMy4zNDE2QzkzLjk1MzggMjMuMjE4NSA5NC45Mzg0IDIxLjk4NzcgOTQuOTM4NCAyMC42MzM5WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTk4Ljc1MzggMTYuMzI2MkgxMDAuNzIzVjE4LjE3MjNDMTAxLjIxNSAxNi45NDE2IDEwMi4yIDE2LjA4IDEwMy42NzcgMTYuMDhWMTguMTcyM0gxMDMuNTU0QzEwMS44MzEgMTguMTcyMyAxMDAuNzIzIDE5LjI4IDEwMC43MjMgMjEuNDk1NFYyNC42OTU0SDk4Ljc1MzhWMTYuMzI2MloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMDQuNjYyIDIwLjUxMDhDMTA0LjY2MiAxOC4wNDkyIDEwNi4zODUgMTYuMDggMTA4Ljg0NiAxNi4wOEMxMTEuNTU0IDE2LjA4IDExMi45MDggMTguMTcyMyAxMTIuOTA4IDIwLjYzMzlDMTEyLjkwOCAyMC43NTY5IDExMi45MDggMjEuMDAzMSAxMTIuOTA4IDIxLjEyNjJIMTA2Ljc1NEMxMDcgMjIuNDggMTA3Ljk4NSAyMy4yMTg1IDEwOS4yMTUgMjMuMjE4NUMxMTAuMiAyMy4yMTg1IDExMC44MTUgMjIuODQ5MiAxMTEuNTU0IDIyLjIzMzlMMTEyLjY2MiAyMy4yMTg1QzExMS44IDI0LjIwMzEgMTEwLjgxNSAyNC44MTg1IDEwOS4yMTUgMjQuODE4NUMxMDYuNTA4IDI0Ljk0MTYgMTA0LjY2MiAyMy4yMTg1IDEwNC42NjIgMjAuNTEwOFpNMTEwLjkzOCAxOS44OTU0QzExMC44MTUgMTguNjY0NiAxMTAuMDc3IDE3LjY4IDEwOC44NDYgMTcuNjhDMTA3LjYxNSAxNy42OCAxMDYuODc3IDE4LjU0MTYgMTA2LjYzMSAxOS44OTU0SDExMC45MzhaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTE0Ljc1NCAxNi4zMjYySDExNi43MjNWMTguMTcyM0MxMTcuMjE1IDE2Ljk0MTYgMTE4LjIgMTYuMDggMTE5LjY3NyAxNi4wOFYxOC4xNzIzSDExOS41NTRDMTE3LjgzMSAxOC4xNzIzIDExNi43MjMgMTkuMjggMTE2LjcyMyAyMS40OTU0VjI0LjY5NTRIMTE0Ljc1NFYxNi4zMjYyWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTExOS44IDIyLjYwMzFIMTIxLjg5MlYyNC44MTg1SDExOS44VjIyLjYwMzFaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTI0LjIzMSAxMy4xMjYySDEyNi4zMjNWMTQuOTcyM0gxMjQuMjMxVjEzLjEyNjJaTTEyNC4zNTQgMTYuMzI2MkgxMjYuMzIzVjI0LjgxODVIMTI0LjM1NFYxNi4zMjYyWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEyOC40MTUgMjAuNjMzOUMxMjguNDE1IDE4LjE3MjQgMTMwLjM4NSAxNi4yMDMxIDEzMi45NjkgMTYuMjAzMUMxMzUuNTU0IDE2LjIwMzEgMTM3LjUyMyAxOC4xNzI0IDEzNy41MjMgMjAuNjMzOUMxMzcuNTIzIDIzLjA5NTQgMTM1LjU1NCAyNS4wNjQ3IDEzMi45NjkgMjUuMDY0N0MxMzAuMjYyIDI0Ljk0MTYgMTI4LjQxNSAyMi45NzI0IDEyOC40MTUgMjAuNjMzOVpNMTM1LjQzMSAyMC42MzM5QzEzNS40MzEgMTkuMTU3IDEzNC4zMjMgMTcuOTI2MiAxMzIuODQ2IDE3LjkyNjJDMTMxLjI0NiAxNy45MjYyIDEzMC4yNjIgMTkuMTU3IDEzMC4yNjIgMjAuNjMzOUMxMzAuMjYyIDIyLjExMDggMTMxLjM2OSAyMy4zNDE2IDEzMi44NDYgMjMuMzQxNkMxMzQuNDQ2IDIzLjIxODUgMTM1LjQzMSAyMS45ODc3IDEzNS40MzEgMjAuNjMzOVoiIGZpbGw9IndoaXRlIi8+CjxkZWZzPgo8ZmlsdGVyIGlkPSJmaWx0ZXIwX2RkXzE4OTRfNDg1MDgzIiB4PSIwIiB5PSIwIiB3aWR0aD0iMzgiIGhlaWdodD0iNDAuNTYiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KPGZlRmxvb2QgZmxvb2Qtb3BhY2l0eT0iMCIgcmVzdWx0PSJCYWNrZ3JvdW5kSW1hZ2VGaXgiLz4KPGZlQ29sb3JNYXRyaXggaW49IlNvdXJjZUFscGhhIiB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMTI3IDAiIHJlc3VsdD0iaGFyZEFscGhhIi8+CjxmZU9mZnNldCBkeT0iMSIvPgo8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIxIi8+CjxmZUNvbG9yTWF0cml4IHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAuMDYyNzQ1MSAwIDAgMCAwIDAuMDk0MTE3NiAwIDAgMCAwIDAuMTU2ODYzIDAgMCAwIDAuMDYgMCIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluMj0iQmFja2dyb3VuZEltYWdlRml4IiByZXN1bHQ9ImVmZmVjdDFfZHJvcFNoYWRvd18xODk0XzQ4NTA4MyIvPgo8ZmVDb2xvck1hdHJpeCBpbj0iU291cmNlQWxwaGEiIHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAxMjcgMCIgcmVzdWx0PSJoYXJkQWxwaGEiLz4KPGZlT2Zmc2V0IGR5PSIxIi8+CjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjEuNSIvPgo8ZmVDb2xvck1hdHJpeCB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMCAwIDAgMCAwLjA2Mjc0NTEgMCAwIDAgMCAwLjA5NDExNzYgMCAwIDAgMCAwLjE1Njg2MyAwIDAgMCAwLjEgMCIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluMj0iZWZmZWN0MV9kcm9wU2hhZG93XzE4OTRfNDg1MDgzIiByZXN1bHQ9ImVmZmVjdDJfZHJvcFNoYWRvd18xODk0XzQ4NTA4MyIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9ImVmZmVjdDJfZHJvcFNoYWRvd18xODk0XzQ4NTA4MyIgcmVzdWx0PSJzaGFwZSIvPgo8L2ZpbHRlcj4KPC9kZWZzPgo8L3N2Zz4K'

  const handlePress = React.useCallback(() => {
    Linking.openURL('https://cexplorer.io')
  }, [])

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        a.p_lg,
        a.align_center,
        a.flex_row,
        a.justify_center,
        a.gap_xs,
        {
          paddingTop: 24,
          paddingBottom: 16,
        },
      ]}
      activeOpacity={0.7}
    >
      <Text style={[a.body_3_sm_regular, ta.text_gray_low]}>Powered by</Text>
      <Image
        source={{uri: cexplorerLogoUri}}
        style={[
          a.rounded_md,
          {width: 146, height: 41, backgroundColor: `#15171F`},
        ]}
        contentFit="contain"
      />
    </TouchableOpacity>
  )
})
PoweredByFooter.displayName = 'PoweredByFooter'
