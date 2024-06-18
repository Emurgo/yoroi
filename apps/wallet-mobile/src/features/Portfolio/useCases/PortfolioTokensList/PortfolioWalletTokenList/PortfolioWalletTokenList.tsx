import {infoExtractName, isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {FlatList, StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {useMetrics} from '../../../../../kernel/metrics/metricsManager'
import {makeList} from '../../../../../kernel/utils'
import {useSearch} from '../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../WalletManager/context/SelectedWalletContext'
import {usePortfolioBalances} from '../../../common/hooks/usePortfolioBalances'
import {usePortfolioPrimaryBalance} from '../../../common/hooks/usePortfolioPrimaryBalance'
import {Line} from '../../../common/Line'
import {TokenEmptyList} from '../../../common/TokenEmptyList'
import {useGetTokensWithBalance} from '../../../common/useGetTokensWithBalance'
import {useStrings} from '../../../common/useStrings'
import {useZeroBalance} from '../../../common/useZeroBalance'
import {BuyADABanner} from '../../PortfolioDashboard/DashboardTokensList/BuyADABanner/BuyADABanner'
import {TotalTokensValue} from '../TotalTokensValue/TotalTokensValue'
import {TokenBalanceItem} from './TokenBalanceItem'
import {TokenBalanceSkeletonItem} from './TokenBalanceSkeletonItem'
import {TradeTokensBannerBig} from './TradeTokensBannerBig'

export const PortfolioWalletTokenList = () => {
  const {styles} = useStyles()
  const {search, isSearching} = useSearch()
  const isZeroADABalance = useZeroBalance()
  const wallet = useSelectedWallet()
  const {track} = useMetrics()
  const balances = usePortfolioBalances({wallet})
  const tokensList = React.useMemo(() => balances.fts ?? [], [balances.fts])

  const isJustADA = React.useMemo(() => {
    if (tokensList.length >= 2) return false
    const tokenInfo = tokensList[0].info
    const isPrimary = isPrimaryToken(tokenInfo)
    return isPrimary
  }, [tokensList])
  const isFirstUser = isJustADA && isZeroADABalance

  const primaryBalance = usePortfolioPrimaryBalance({wallet})
  const {isLoading: tokensLoading} = useGetTokensWithBalance()

  const getListTokens = React.useMemo(() => {
    if (isSearching) {
      return tokensList.filter((token) => {
        const name = infoExtractName(token.info)
        return name.toLowerCase().includes(search.toLowerCase())
      })
    }

    return tokensList
  }, [isSearching, search, tokensList])

  React.useEffect(() => {
    let timeout: NodeJS.Timeout | undefined

    const sendMetrics = () => {
      clearTimeout(timeout)

      timeout = setTimeout(() => {
        track.portfolioTokensListSearchActivated({search_term: search})
      }, 500)
    }

    if (isSearching && search.length > 0) sendMetrics()

    return () => clearTimeout(timeout)
  }, [isSearching, search, track])

  const renderFooterList = () => {
    if (tokensLoading) return makeList(6).map((_, index) => <SkeletonItem key={index} />)
    if (isSearching) return null
    if (isZeroADABalance) {
      return (
        <View>
          <Spacer height={16} />

          <BuyADABanner />
        </View>
      )
    }
    if (isJustADA)
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
            amount={primaryBalance}
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
          <TotalTokensValue amount={amount} cardType="wallet" />

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
      ...atoms.flex_1,
      backgroundColor: color.gray_cmin,
    },
    textAvailable: {
      color: color.gray_c700,
      ...atoms.body_2_md_regular,
    },
    container: {
      ...atoms.px_lg,
      ...atoms.flex_grow,
    },
  })

  return {styles} as const
}
