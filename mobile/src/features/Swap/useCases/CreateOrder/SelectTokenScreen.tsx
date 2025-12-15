import {isNonNullable, isString} from '@yoroi/common'
import {amountBreakdown, isPrimaryToken, sortTokenInfos} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {useNavigation} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {usePortfolioBalances} from '~/features/Portfolio/common/hooks/usePortfolioBalances'
import {usePortfolioTokenActivity} from '~/features/Portfolio/context/PortfolioTokenActivityProvider'
import {useSearch, useSearchOnNavBar} from '~/features/Search/SearchContext'
import {filterBySearch} from '~/features/Swap/common/filterBySearch'
import {useSwap} from '~/features/Swap/common/useSwap'
import {useStrings} from '~/kernel/i18n/useStrings'
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

type Direction = SwapTokenRoutes['select-token']

const getSortTokensFn =
  (calculateTokenValue: (token: Portfolio.Token.Amount) => BigNumber) =>
  (a: Portfolio.Token.Amount, b: Portfolio.Token.Amount) => {
    if (isPrimaryToken(a.info)) return -1
    if (isPrimaryToken(b.info)) return 1

    const valueA = calculateTokenValue(a)
    const valueB = calculateTokenValue(b)
    return valueB.comparedTo(valueA) ?? 0
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
      if (isPrimaryToken(tokenAmount.info)) return new BigNumber(Infinity)

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
  const {tokenInfos, verifiedTokens} = useSwap()
  const {search: assetSearchTerm} = useSearch()
  const balances = usePortfolioBalances({wallet})
  const {tokenActivity} = usePortfolioTokenActivity()
  const {atoms: ta} = useTheme()

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
      isPrimaryToken(availableTokens[0]?.info)
    ) {
      return [availableTokens[0]!.info.id]
    }

    if (availableTokens.length > 1) {
      return availableTokens
        .sort(getSortTokensFn(calculateTokenValue))
        .map(({info: {id}}) => id)
    }

    return availableTokens.map(({info: {id}}) => id)
  }, [balances.all, tokenInfos, calculateTokenValue])

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
      .map((ti: Portfolio.Token.Id) => tokenInfos.get(ti))
      .filter(isNonNullable)
      .filter(({id}: Portfolio.Token.Info) => !ownedTokens.includes(id))

    const remainingTokens = Array.from(tokenInfos.values()).filter(
      ({id}) => !(ownedTokens.includes(id) || verifiedTokens.includes(id)),
    )

    const sortedRemainingTokens = sortTokenInfos({
      secondaryTokenInfos: remainingTokens,
      primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
    })

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
        <Text style={[ta.text_gray_low, a.p_lg]}>{item}</Text>
      ) : (
        <SelectableToken
          tokenInfo={item}
          quantity={balances.records.get(item.id)?.quantity ?? 0n}
          direction={direction}
        />
      ),
    [ta.text_gray_low, direction, balances],
  )

  const keyExtractor = React.useCallback(
    (item: Portfolio.Token.Info | string) =>
      isString(item) ? item : `${item.name}-${item.id}`,
    [],
  )

  if (!balances.all || !tokenInfos || tokenInfos.size === 0) {
    return (
      <View style={a.flex_1}>
        <View style={[a.flex_1, a.flex_col]}>
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
    const {id} = tokenInfo
    const {closeSearch} = useSearch()
    const swapForm = useSwap()
    const navigation = useNavigation()

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
      navigation.goBack()
      closeSearch()
    }, [
      id,
      direction,
      shouldSwitchTokens,
      shouldUpdateToken,
      swapForm,
      navigation,
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
