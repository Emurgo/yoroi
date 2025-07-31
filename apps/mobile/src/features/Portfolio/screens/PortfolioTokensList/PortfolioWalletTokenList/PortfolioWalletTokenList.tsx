import {useFocusEffect} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import {
  amountBreakdown,
  infoExtractName,
  isPrimaryToken,
} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {Text, View} from 'react-native'

import {aggregatePrimaryAmount} from '~/features/Portfolio/common/helpers/aggregatePrimaryAmount'
import {useStrings} from '~/features/Portfolio/common/hooks/useStrings'
import {useZeroBalance} from '~/features/Portfolio/common/hooks/useZeroBalance'
import {usePortfolio} from '~/features/Portfolio/context/PortfolioProvider'
import {usePortfolioTokenActivity} from '~/features/Portfolio/context/PortfolioTokenActivityProvider'
import {TokenEmptyList} from '~/features/Portfolio/ui/TokenEmptyList/TokenEmptyList'
import {useSearch} from '~/features/Search/SearchContext'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {makeList} from '~/kernel/utils'
import {Line} from '~/ui/Line/Line'
import {Space} from '~/ui/Space/Space'
import {TotalTokensValue} from '../TotalTokensValue/TotalTokensValue'
import {TokenBalanceItem} from './TokenBalanceItem'
import {TokenBalanceSkeletonItem} from './TokenBalanceSkeletonItem'
import {TradeTokensBannerBig} from './TradeTokensBannerBig'

export const PortfolioWalletTokenList = () => {
  const {atoms: ta, palette: p} = useTheme()
  const {search, isSearching} = useSearch()
  const isZeroADABalance = useZeroBalance()
  const {resetTabs} = usePortfolio()
  const {track} = useMetrics()

  const {
    wallet: {balances, portfolioPrimaryTokenInfo},
  } = useSelectedWallet()
  const {tokenActivity, isLoading} = usePortfolioTokenActivity()

  const amount = React.useMemo(
    () =>
      aggregatePrimaryAmount({
        tokenAmountRecords: Object.fromEntries(balances.records.entries()),
        primaryTokenInfo: portfolioPrimaryTokenInfo,
        tokenActivity,
      }),
    [balances.records, portfolioPrimaryTokenInfo, tokenActivity],
  )

  const tokensList = React.useMemo(
    () =>
      [...balances.fts].sort((a, b) => {
        if (isPrimaryToken(a.info)) return -1 // `a` is the PrimaryToken, so it should come first
        if (isPrimaryToken(b.info)) return 1 // `b` is the PrimaryToken, so it should come first

        // Compare based on weighted value (price * amount)
        const comparison = (
          tokenActivity[b.info.id]?.price.close ?? new BigNumber(0)
        )
          .multipliedBy(amountBreakdown(b).bn)
          .comparedTo(
            (
              tokenActivity[a.info.id]?.price.close ?? new BigNumber(0)
            ).multipliedBy(amountBreakdown(a).bn),
          )

        return comparison ?? 0
      }) ?? [],
    [balances.fts, tokenActivity],
  )
  const isJustPt = tokensList.length === 1 && isPrimaryToken(tokensList[0].info)

  const isFirstUser = isJustPt && isZeroADABalance

  const filteredTokens = React.useMemo(() => {
    if (isSearching) {
      return tokensList.filter((token) => {
        const name = infoExtractName(token.info)
        return name.toLowerCase().includes(search.toLowerCase())
      })
    }

    return tokensList
  }, [isSearching, search, tokensList])

  useFocusEffect(
    React.useCallback(() => {
      resetTabs()
    }, [resetTabs]),
  )

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined

    const sendMetrics = () => {
      clearTimeout(timeout)

      timeout = setTimeout(() => {
        track.portfolioTokensListSearchActivated({search_term: search})
      }, 500) // 0.5s requirement
    }

    if (isSearching && search.length > 0) sendMetrics()

    return () => clearTimeout(timeout)
  }, [isSearching, search, track])

  const renderFooterList = () => {
    if (isSearching) return null
    if (isLoading) {
      return (
        <View>
          <Space.Height.md />

          {makeList(6).map((_, index) => (
            <SkeletonItem key={index} />
          ))}
        </View>
      )
    }

    if (isJustPt)
      return (
        <View>
          <Space.Height.md />

          <TradeTokensBannerBig />
        </View>
      )

    return null
  }

  return (
    <View style={[{backgroundColor: p.bg_color_max}, a.flex_1]}>
      <FlashList
        data={filteredTokens}
        ListHeaderComponent={
          <HeadingList
            isShowBalanceCard={!isSearching}
            countTokensList={filteredTokens.length}
            amount={amount}
            isFirstUser={isFirstUser}
          />
        }
        ListFooterComponent={renderFooterList}
        ItemSeparatorComponent={() => <Space.Height.md />}
        renderItem={({item}) => <TokenBalanceItem amount={item} />}
        contentContainerStyle={[a.px_lg, a.flex_grow]}
        ListEmptyComponent={() => <TokenEmptyList />}
        estimatedItemSize={72}
      />
    </View>
  )
}

type HeadingListProps = {
  isFirstUser: boolean
  isShowBalanceCard: boolean
  countTokensList: number
  amount: Portfolio.Token.Amount
}
const HeadingList = ({
  isFirstUser,
  isShowBalanceCard,
  countTokensList,
  amount,
}: HeadingListProps) => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View>
      {isShowBalanceCard ? (
        <View>
          <TotalTokensValue amount={amount} />

          <Line />
        </View>
      ) : null}

      <Space.Height.md />

      <Text style={[{color: p.gray_700}, a.body_2_md_regular]}>
        {strings.tokensAvailable(isFirstUser ? 0 : countTokensList)}
      </Text>

      <Space.Height.sm />
    </View>
  )
}

const SkeletonItem = () => {
  return (
    <View>
      <TokenBalanceSkeletonItem />

      <Space.Height.md />
    </View>
  )
}
