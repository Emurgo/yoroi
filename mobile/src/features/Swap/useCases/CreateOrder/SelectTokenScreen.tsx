import {isNonNullable, isString} from '@yoroi/common'
import {amountBreakdown, isPrimaryToken, sortTokenInfos} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'

import {FlashList} from '@shopify/flash-list'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {getTokenIdParts} from '~/features/Portfolio/common/helpers/get-token-id-parts'
import {usePortfolioBalances} from '~/features/Portfolio/common/hooks/usePortfolioBalances'
import {usePortfolioTokenActivity} from '~/features/Portfolio/context/PortfolioTokenActivityProvider'
import {useSearch, useSearchOnNavBar} from '~/features/Search/SearchContext'
import {filterBySearch} from '~/features/Swap/common/filterBySearch'
import {useSwap} from '~/features/Swap/common/useSwap'
import {useSwapConfig} from '~/features/Swap/common/useSwapConfig'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {SwapTokenRoutes} from '~/kernel/navigation/types'
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

export const SelectTokenScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {direction} = useUnsafeParams<Direction>()

  useSearchOnNavBar({
    placeholder: strings.swap.searchTokens,
    title: direction === 'in' ? strings.swap.swapFrom : strings.swap.swapTo,
  })

  return (
    <SafeAreaView
      style={[a.flex_1, {backgroundColor: p.bg_color_max}]}
      edges={['left', 'right']}
    >
      <ErrorBoundary
        fallbackRender={({resetErrorBoundary}) => (
          <ServiceUnavailable resetErrorBoundary={resetErrorBoundary} />
        )}
      >
        <TokenList direction={direction} />
      </ErrorBoundary>
    </SafeAreaView>
  )
}

const useTokenValueCalculator = (
  tokenActivity: Portfolio.Api.TokenActivityResponse,
) => {
  return React.useCallback(
    (tokenAmount: Portfolio.Token.Amount) => {
      if (isPrimaryToken(tokenAmount.info)) return new BigNumber(Infinity) // Primary token always first

      const price =
        tokenActivity[tokenAmount.info.id]?.price.close ?? new BigNumber(0)
      const amount = amountBreakdown(tokenAmount).bn
      return price.multipliedBy(amount)
    },
    [tokenActivity],
  )
}

const TokenList = ({direction}: Direction) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {tokenInfos} = useSwap()
  const {search: assetSearchTerm} = useSearch()
  const balances = usePortfolioBalances({wallet})
  const {swapConfig} = useSwapConfig()
  const {tokenActivity} = usePortfolioTokenActivity()
  const {palette: p} = useTheme()

  const calculateTokenValue = useTokenValueCalculator(tokenActivity)

  const ownedTokens = React.useMemo(() => {
    if (!balances.all || !tokenInfos || tokenInfos.size === 0) {
      return []
    }

    const availableTokens = balances.all.filter((token) =>
      tokenInfos.has(token.info.id),
    )

    if (
      availableTokens.length === 1 &&
      isPrimaryToken(availableTokens[0].info)
    ) {
      return [availableTokens[0].info.id]
    }

    if (availableTokens.length > 1) {
      return availableTokens
        .sort((a, b) => {
          if (isPrimaryToken(a.info)) return -1
          if (isPrimaryToken(b.info)) return 1

          const valueA = calculateTokenValue(a)
          const valueB = calculateTokenValue(b)
          return valueB.comparedTo(valueA) ?? 0
        })
        .map(({info: {id}}) => id)
    }

    return availableTokens.map(({info: {id}}) => id)
  }, [balances.all, tokenInfos, calculateTokenValue])

  const verifiedTokens = React.useMemo(
    () => swapConfig?.verifiedTokens?.filter((ti) => tokenInfos.has(ti)) ?? [],
    [swapConfig?.verifiedTokens, tokenInfos],
  )

  const filteredTokenList = React.useMemo(() => {
    if (!tokenInfos || tokenInfos.size === 0) {
      return []
    }

    const ownedList = ownedTokens
      .map((ti) => tokenInfos.get(ti))
      .filter(isNonNullable)

    if (direction === 'in') {
      const result = [strings.swap.yourAssets, ...ownedList]
      return assetSearchTerm
        ? result.filter(filterBySearch(assetSearchTerm))
        : result
    }

    const verifiedList = verifiedTokens
      .map((ti) => tokenInfos.get(ti))
      .filter(isNonNullable)
      .filter(({id}) => !ownedTokens.includes(id))

    const remainingTokens = Array.from(tokenInfos.values()).filter(
      ({id}) => !(ownedTokens.includes(id) || verifiedTokens.includes(id)),
    )

    const MAX_TOKENS_TO_SORT = 1000
    let sortedRemainingTokens: readonly Portfolio.Token.Info[] = []

    if (remainingTokens.length > MAX_TOKENS_TO_SORT) {
      const tokensToSort = remainingTokens.slice(0, MAX_TOKENS_TO_SORT)

      const simpleSorted = [...tokensToSort].sort((a, b) => {
        const nameA = (a.ticker || a.name).toLowerCase()
        const nameB = (b.ticker || b.name).toLowerCase()
        return nameA.localeCompare(nameB)
      })

      const remainingUnsorted = remainingTokens.slice(MAX_TOKENS_TO_SORT)
      sortedRemainingTokens = [...simpleSorted, ...remainingUnsorted]
    } else {
      sortedRemainingTokens = sortTokenInfos({
        secondaryTokenInfos: remainingTokens,
        primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
      })
    }

    const result = [
      strings.swap.yourAssets,
      ...ownedList,
      strings.swap.allAssets,
      ...verifiedList,
      ...sortedRemainingTokens,
    ]

    return assetSearchTerm
      ? result.filter(filterBySearch(assetSearchTerm))
      : result
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

  const renderItem = React.useCallback(
    ({item}: {item: Portfolio.Token.Info | string}) =>
      isString(item) ? (
        <Text style={[{color: p.text_gray_low}, a.p_lg]}>{item}</Text>
      ) : (
        <SelectableToken
          tokenInfo={item}
          quantity={wallet.balances.records.get(item.id)?.quantity ?? 0n}
          direction={direction}
        />
      ),
    [p.text_gray_low, direction, wallet.balances.records],
  )

  const keyExtractor = React.useCallback(
    (item: Portfolio.Token.Info | string) =>
      isString(item) ? item : `${item.name}-${item.id}`,
    [],
  )

  if (!balances.all || !tokenInfos || tokenInfos.size === 0) {
    return (
      <View style={a.flex_1}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {Array.from({length: 6}).map((_, i) => (
            <AmountItemPlaceholder key={i} style={[a.py_sm, a.px_lg]} />
          ))}
        </View>
      </View>
    )
  }

  return (
    <View style={a.flex_1}>
      <FlashList
        data={filteredTokenList}
        renderItem={renderItem}
        bounces={false}
        keyExtractor={keyExtractor}
        testID="assetsList"
        estimatedItemSize={72}
        ListEmptyComponent={<EmptyList />}
        removeClippedSubviews={true}
        getItemType={(item) => (typeof item === 'string' ? 'header' : 'token')}
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

    const shouldUpdateToken =
      direction === 'in'
        ? id !== swapForm.tokenInInput.tokenId ||
          !swapForm.tokenInInput.isTouched
        : id !== swapForm.tokenOutInput.tokenId ||
          !swapForm.tokenOutInput.isTouched
    const shouldSwitchTokens =
      direction === 'in'
        ? id === swapForm.tokenOutInput.tokenId &&
          swapForm.tokenOutInput.isTouched
        : id === swapForm.tokenInInput.tokenId &&
          swapForm.tokenInInput.isTouched

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
      name,
      ticker,
      track,
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

const EmptyList = () => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()

  if (isSearching && assetSearchTerm.length > 0)
    return <EmptySearchResult assetSearchTerm={assetSearchTerm} />

  return null
}

const EmptySearchResult = ({assetSearchTerm}: {assetSearchTerm: string}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  return (
    <View style={[a.flex_1]}>
      <Space.Height.xl />

      <NoAssetFoundImage
        style={[a.flex_1, {alignSelf: 'center', width: 200, height: 228}]}
      />

      <Space.Height.lg />

      <Text style={[a.flex_1, a.text_center, a.pt_xs, {color: p.gray_max}]}>
        {assetSearchTerm === ''
          ? strings.swap.noAssetsFound
          : strings.swap.noAssetsFoundFor(assetSearchTerm)}
      </Text>
    </View>
  )
}
