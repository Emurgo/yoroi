import {isNonNullable, isString} from '@yoroi/common'
import {isPrimaryToken, sortTokenInfos} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'

import BigNumber from 'bignumber.js'
import * as React from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {FlatList, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {getTokenIdParts} from '~/features/Portfolio/common/helpers/get-token-id-parts'
import {usePortfolioBalances} from '~/features/Portfolio/common/hooks/usePortfolioBalances'
import {usePortfolioTokenActivity} from '~/features/Portfolio/context/PortfolioTokenActivityProvider'
import {useSearch, useSearchOnNavBar} from '~/features/Search/SearchContext'
import {filterBySearch} from '~/features/Swap/common/filterBySearch'
import {useSwap} from '~/features/Swap/common/useSwap'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useYoroiConfig} from '~/kernel/features'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {SwapTokenRoutes} from '~/kernel/navigation/types'
import {Boundary} from '~/ui/Boundary/Boundary'
import {Counter} from '~/ui/Counter/Counter'
import {NoAssetFoundImage} from '~/ui/NoAssetFoundImage/NoAssetFoundImage'
import {ServiceUnavailable} from '~/ui/ServiceUnavailable/ServiceUnavailable'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {
  AmountItemPlaceholder,
  TokenAmountItem,
} from '~/ui/TokenAmountItem/TokenAmountItem'

import {useNavigateTo} from '../../common/navigation'

type Direction = SwapTokenRoutes['select-token']

const loading = {
  fallback: (
    <View style={[a.flex_1, a.flex_col]}>
      {Array.from({length: 6}).map((_, i) => (
        <AmountItemPlaceholder key={i} style={[a.py_sm, a.px_lg]} />
      ))}
    </View>
  ),
}

export const SelectTokenScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {direction} = useUnsafeParams<Direction>()

  useSearchOnNavBar({
    placeholder: strings.swap.searchTokens,
    title: direction === 'in' ? strings.swap.swapFrom : strings.swap.swapTo,
  })

  return (
    <SafeAreaView style={[a.flex_1, ta.bg_color_max]} edges={['left', 'right']}>
      <Boundary loading={loading}>
        <ErrorBoundary
          fallbackRender={({resetErrorBoundary}) => (
            <ServiceUnavailable resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <TokenList direction={direction} />
        </ErrorBoundary>
      </Boundary>
    </SafeAreaView>
  )
}

const TokenList = ({direction}: Direction) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {tokenInfos} = useSwap()
  const {search: assetSearchTerm} = useSearch()
  const balances = usePortfolioBalances({wallet})
  const {config} = useYoroiConfig()
  const {tokenActivity, isLoading: isTokenActivityLoading} =
    usePortfolioTokenActivity()
  const [displayLimit, setDisplayLimit] = React.useState(20)

  const isLoading =
    isTokenActivityLoading || !tokenInfos || tokenInfos.size === 0

  const ownedTokens = React.useMemo(() => {
    if (!balances.all || !tokenInfos || tokenInfos.size === 0) {
      return []
    }

    const swappableBalances = balances.all.filter((token) =>
      tokenInfos.has(token.info.id),
    )

    if (swappableBalances.length === 0) {
      return []
    }

    // Separate primary tokens and secondary tokens for more efficient sorting
    const primaryTokens = swappableBalances.filter((token) =>
      isPrimaryToken(token.info),
    )
    const secondaryTokens = swappableBalances.filter(
      (token) => !isPrimaryToken(token.info),
    )

    const sortedSecondaryTokens = secondaryTokens
      .sort((a, b) => {
        const aPrice = tokenActivity[a.info.id]?.price.close ?? new BigNumber(0)
        const bPrice = tokenActivity[b.info.id]?.price.close ?? new BigNumber(0)
        return bPrice.comparedTo(aPrice) ?? 0
      })
      .slice(0, 200)

    // Combine primary tokens first, then sorted secondary tokens
    const allSortedTokens = [...primaryTokens, ...sortedSecondaryTokens]

    return allSortedTokens.map(({info: {id}}) => id)
  }, [balances.all, tokenActivity, tokenInfos])

  const verifiedTokens = React.useMemo(
    () =>
      config.swap?.verifiedTokens?.filter((ti: Portfolio.Token.Id) =>
        tokenInfos.has(ti),
      ) ?? [],
    [config.swap?.verifiedTokens, tokenInfos],
  )

  const filteredTokenList = React.useMemo(() => {
    if (!tokenInfos || tokenInfos.size === 0) {
      return []
    }

    const ownedTokensSet = new Set(ownedTokens)
    const verifiedTokensSet = new Set(verifiedTokens)

    if (direction === 'in') {
      const ownedList = ownedTokens
        .slice(0, 100)
        .map((ti) => tokenInfos.get(ti))
        .filter(isNonNullable)

      return [strings.swap.yourAssets, ...ownedList].filter(
        filterBySearch(assetSearchTerm),
      )
    }

    const verifiedList = verifiedTokens
      .map((ti: Portfolio.Token.Id) => tokenInfos.get(ti))
      .filter(isNonNullable)
      .filter(({id}: Portfolio.Token.Info) => !ownedTokens.includes(id))

    const allTokenValues = Array.from(tokenInfos.values())
    const limitedTokens = allTokenValues.slice(0, 300)

    const otherTokens = sortTokenInfos({
      secondaryTokenInfos: limitedTokens.filter(
        ({id}) => !(ownedTokensSet.has(id) || verifiedTokensSet.has(id)),
      ),
      primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
    })

    return [
      strings.swap.yourAssets,
      strings.swap.allAssets,
      ...verifiedList,
      ...otherTokens,
    ].filter(filterBySearch(assetSearchTerm))
  }, [
    ownedTokens,
    direction,
    strings.swap.yourAssets,
    strings.swap.allAssets,
    wallet.portfolioPrimaryTokenInfo,
    assetSearchTerm,
    verifiedTokens,
    tokenInfos,
  ])

  const displayTokenList = React.useMemo(() => {
    return filteredTokenList.slice(0, displayLimit)
  }, [filteredTokenList, displayLimit])

  const loadMore = React.useCallback(() => {
    setDisplayLimit((prev) => {
      const newLimit = prev + 20
      return newLimit < filteredTokenList.length ? newLimit : prev
    })
  }, [filteredTokenList.length])

  React.useEffect(() => {
    setDisplayLimit(20)
  }, [assetSearchTerm])

  const balanceRecords = React.useMemo(
    () => wallet.balances.records,
    [wallet.balances.records],
  )

  const keyExtractor = React.useCallback(
    (item: Portfolio.Token.Info | string) =>
      isString(item) ? item : `${item.name}-${item.id}`,
    [],
  )

  const renderItem = React.useCallback(
    ({item}: {item: Portfolio.Token.Info | string; index: number}) => (
      <TokenItem
        item={item}
        direction={direction}
        balanceRecords={balanceRecords}
      />
    ),
    [direction, balanceRecords],
  )

  const ListEmptyComponent = React.useMemo(() => <EmptyList />, [])

  if (isLoading || !balances.all) {
    return loading.fallback
  }

  return (
    <View style={a.flex_1}>
      <FlatList
        data={displayTokenList}
        renderItem={renderItem}
        bounces={false}
        keyExtractor={keyExtractor}
        testID="assetsList"
        ListEmptyComponent={ListEmptyComponent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        updateCellsBatchingPeriod={50}
        onEndReachedThreshold={0.5}
        getItemLayout={(data, index) => {
          const item = data?.[index]
          const isHeader = typeof item === 'string'
          const length = isHeader ? 40 : 72

          // Calculate offset by iterating through previous items
          let offset = 0
          if (data && index > 0) {
            for (let i = 0; i < index; i++) {
              const prevItem = data[i]
              offset += typeof prevItem === 'string' ? 40 : 72
            }
          }

          return {
            length,
            offset,
            index,
          }
        }}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          displayTokenList.length === 0 ? a.flex_1 : undefined
        }
        onEndReached={loadMore}
        disableVirtualization={false}
        disableIntervalMomentum={false}
        snapToAlignment="start"
        decelerationRate="normal"
      />

      <Space.Height.md />

      <Counter
        counter={filteredTokenList.length}
        style={a.py_lg}
        unitsText={strings.swap.tokens(filteredTokenList.length)}
        closingText={strings.swap.found}
      />
    </View>
  )
}

type SelectableTokenProps = Direction & {
  tokenInfo: Portfolio.Token.Info
  quantity: bigint
}

const SelectableToken = React.memo(
  ({direction, tokenInfo, quantity}: SelectableTokenProps) => {
    const {id, name, ticker} = tokenInfo
    const {closeSearch} = useSearch()
    const swapForm = useSwap()
    const navigateTo = useNavigateTo()
    const {track} = useMetrics()

    const shouldUpdateToken = React.useMemo(
      () =>
        direction === 'in'
          ? id !== swapForm.tokenInInput.tokenId ||
            !swapForm.tokenInInput.isTouched
          : id !== swapForm.tokenOutInput.tokenId ||
            !swapForm.tokenOutInput.isTouched,
      [
        direction,
        id,
        swapForm.tokenInInput.tokenId,
        swapForm.tokenInInput.isTouched,
        swapForm.tokenOutInput.tokenId,
        swapForm.tokenOutInput.isTouched,
      ],
    )

    const shouldSwitchTokens = React.useMemo(
      () =>
        direction === 'in'
          ? id === swapForm.tokenOutInput.tokenId &&
            swapForm.tokenOutInput.isTouched
          : id === swapForm.tokenInInput.tokenId &&
            swapForm.tokenInInput.isTouched,
      [
        direction,
        id,
        swapForm.tokenOutInput.tokenId,
        swapForm.tokenOutInput.isTouched,
        swapForm.tokenInInput.tokenId,
        swapForm.tokenInInput.isTouched,
      ],
    )

    const handleOnTokenSelection = React.useCallback(() => {
      const {policyId} = getTokenIdParts(id)

      if (direction === 'in') {
        track.swapAssetFromChanged({
          from_asset: [
            {asset_name: name, asset_ticker: ticker, policy_id: policyId},
          ],
        })
      } else {
        track.swapAssetToChanged({
          to_asset: [
            {asset_name: name, asset_ticker: ticker, policy_id: policyId},
          ],
        })
      }

      if (shouldSwitchTokens) {
        swapForm.action({type: 'ResetAmounts'})
        swapForm.action({type: 'SwitchTouched'})
      }

      if (shouldUpdateToken) {
        swapForm.action({
          type: direction === 'in' ? 'TokenInIdChanged' : 'TokenOutIdChanged',
          value: id,
        })
        swapForm.action({
          type:
            direction === 'in' ? 'TokenInInputTouched' : 'TokenOutInputTouched',
        })
      }
      navigateTo.startSwap()
      closeSearch()
    }, [
      id,
      direction,
      track,
      name,
      ticker,
      shouldSwitchTokens,
      shouldUpdateToken,
      swapForm,
      navigateTo,
      closeSearch,
    ])

    return (
      <TouchableOpacity
        style={[a.py_sm, a.px_lg]}
        onPress={handleOnTokenSelection}
        testID="selectTokenButton"
      >
        <TokenAmountItem
          amount={{info: tokenInfo, quantity}}
          ignorePrivacy
          variant="swap"
        />
      </TouchableOpacity>
    )
  },
)

SelectableToken.displayName = 'SelectableToken'

const TokenItem = React.memo(
  ({
    item,
    direction,
    balanceRecords,
  }: {
    item: Portfolio.Token.Info | string
    direction: 'in' | 'out'
    balanceRecords: Map<string, any>
  }) => {
    const {palette: p} = useTheme()

    if (isString(item)) {
      return <Text style={[{color: p.text_gray_low}, a.p_lg]}>{item}</Text>
    }

    return (
      <Boundary
        loading={{
          fallback: <AmountItemPlaceholder style={[a.py_sm, a.px_lg]} />,
        }}
      >
        <SelectableToken
          tokenInfo={item}
          quantity={balanceRecords.get(item.id)?.quantity ?? 0n}
          direction={direction}
        />
      </Boundary>
    )
  },
)

const EmptyList = () => {
  const {search: assetSearchTerm} = useSearch()

  if (assetSearchTerm.length > 0)
    return <EmptySearchResult assetSearchTerm={assetSearchTerm} />

  return null
}

const EmptySearchResult = ({assetSearchTerm}: {assetSearchTerm: string}) => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  return (
    <View style={[a.flex_1]}>
      <Space.Height.xl />

      <NoAssetFoundImage
        style={[a.flex_1, {alignSelf: 'center', width: 200, height: 228}]}
      />

      <Space.Height.lg />

      <Text
        style={[
          a.flex_1,
          a.text_center,
          a.pt_xs,
          ta.text_gray_max,
          a.body_1_lg_medium,
        ]}
      >
        {assetSearchTerm === ''
          ? strings.swap.noAssetsFound
          : strings.swap.noAssetsFoundFor(assetSearchTerm)}
      </Text>
    </View>
  )
}
