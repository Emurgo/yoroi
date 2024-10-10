import {useFocusEffect} from '@react-navigation/native'
import {infoExtractName, isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Chain, Portfolio} from '@yoroi/types'
import * as React from 'react'
import {FlatList, StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../../components/Spacer/Spacer'
import {useMetrics} from '../../../../../kernel/metrics/metricsManager'
import {makeList} from '../../../../../kernel/utils'
import {PreprodFaucetBanner} from '../../../../Exchange/common/ShowBuyBanner/PreprodFaucetBanner'
import {SanchonetFaucetBanner} from '../../../../Exchange/common/ShowBuyBanner/SanchonetFaucetBanner'
import {useSearch} from '../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../../WalletManager/context/WalletManagerProvider'
import {aggregatePrimaryAmount} from '../../../common/helpers/aggregatePrimaryAmount'
import {useStrings} from '../../../common/hooks/useStrings'
import {useZeroBalance} from '../../../common/hooks/useZeroBalance'
import {Line} from '../../../common/Line'
import {usePortfolio} from '../../../common/PortfolioProvider'
import {usePortfolioTokenActivity} from '../../../common/PortfolioTokenActivityProvider'
import {TokenEmptyList} from '../../../common/TokenEmptyList/TokenEmptyList'
import {BuyADABanner} from '../../PortfolioDashboard/DashboardTokensList/BuyADABanner/BuyADABanner'
import {TotalTokensValue} from '../TotalTokensValue/TotalTokensValue'
import {TokenBalanceItem} from './TokenBalanceItem'
import {TokenBalanceSkeletonItem} from './TokenBalanceSkeletonItem'
import {TradeTokensBannerBig} from './TradeTokensBannerBig'

export const PortfolioWalletTokenList = () => {
  const {styles} = useStyles()
  const {search, isSearching} = useSearch()
  const isZeroADABalance = useZeroBalance()
  const {resetTabs} = usePortfolio()
  const {track} = useMetrics()
  const {
    selected: {network},
  } = useWalletManager()

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

  const tokensList = React.useMemo(() => balances.fts ?? [], [balances.fts])
  const isJustPt = tokensList.length === 1 && isPrimaryToken(tokensList[0].info)

  const isFirstUser = isJustPt && isZeroADABalance

  const getListTokens = React.useMemo(() => {
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

  const isPreprod = network === Chain.Network.Preprod
  const isSancho = network === Chain.Network.Sancho

  const renderFooterList = () => {
    if (isSearching) return null
    if (isLoading) {
      return (
        <View>
          <Spacer height={16} />

          {makeList(6).map((_, index) => (
            <SkeletonItem key={index} />
          ))}
        </View>
      )
    }
    if (isZeroADABalance) {
      return (
        <View>
          <Spacer height={16} />

          {isPreprod ? <PreprodFaucetBanner /> : isSancho ? <SanchonetFaucetBanner /> : <BuyADABanner />}
        </View>
      )
    }
    if (isJustPt)
      return (
        <View>
          <Spacer height={16} />

          <TradeTokensBannerBig />
        </View>
      )

    return null
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={getListTokens}
        ListHeaderComponent={
          <HeadingList
            isShowBalanceCard={!isSearching}
            countTokensList={getListTokens.length}
            amount={amount}
            isFirstUser={isFirstUser}
          />
        }
        ListFooterComponent={renderFooterList}
        ItemSeparatorComponent={() => <Spacer height={16} />}
        renderItem={({item}) => <TokenBalanceItem amount={item} />}
        contentContainerStyle={styles.container}
        ListEmptyComponent={() => <TokenEmptyList />}
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
const HeadingList = ({isFirstUser, isShowBalanceCard, countTokensList, amount}: HeadingListProps) => {
  const strings = useStrings()
  const {styles} = useStyles()

  return (
    <View>
      {isShowBalanceCard ? (
        <View>
          <TotalTokensValue amount={amount} />

          <Line />
        </View>
      ) : null}

      <Spacer height={16} />

      <Text style={styles.textAvailable}>{strings.tokensAvailable(isFirstUser ? 0 : countTokensList)}</Text>

      <Spacer height={8} />
    </View>
  )
}

const SkeletonItem = () => {
  return (
    <View>
      <TokenBalanceSkeletonItem />

      <Spacer height={16} />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_max,
      ...atoms.flex_1,
    },
    textAvailable: {
      color: color.gray_700,
      ...atoms.body_2_md_regular,
    },
    container: {
      ...atoms.px_lg,
      ...atoms.flex_grow,
    },
  })

  return {styles} as const
}
