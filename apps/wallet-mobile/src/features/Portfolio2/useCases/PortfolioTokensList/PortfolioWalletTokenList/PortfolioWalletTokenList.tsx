import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {FlatList, StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {useSearch} from '../../../../../features/Search/SearchContext'
import {makeList} from '../../../../../kernel/utils'
import {Line} from '../../../common/Line'
import {TokenEmptyList} from '../../../common/TokenEmptyList'
import {useGetPortfolioBalance} from '../../../common/useGetPortfolioBalance'
import {useGetTokensWithBalance} from '../../../common/useGetTokensWithBalance'
import {useStrings} from '../../../common/useStrings'
import {TotalTokensValue} from '../TotalTokensValue/TotalTokensValue'
import {TokenBalanceItem} from './TokenBalanceItem'

export const PortfolioWalletTokenList = () => {
  const {styles} = useStyles()
  const {search, isSearching} = useSearch()

  const {data: portfolioData, isLoading: balanceLoading} = useGetPortfolioBalance()
  const usdExchangeRate = portfolioData?.usdExchangeRate ?? 1

  const currentBalance = new BigNumber(portfolioData?.currentBalance ?? 0)
  const oldBalance = new BigNumber(portfolioData?.oldBalance ?? 0)

  const {data: tokensData, isLoading: tokensLoading} = useGetTokensWithBalance()

  const getListTokens = React.useMemo(() => {
    const tokensList = tokensData ?? []

    if (isSearching) {
      return tokensList.filter((token) => token.symbol.toLowerCase().includes(search.toLowerCase()))
    }

    return tokensList
  }, [isSearching, search, tokensData])

  const renderFooterList = () => {
    if (tokensLoading) return makeList(6).map((_, index) => <SkeletonItem key={index} />)
    if (getListTokens.length === 0) return <TokenEmptyList />

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
            balanceInfo={{currentBalance, oldBalance, usdExchangeRate, isLoadingBalance: balanceLoading}}
          />
        }
        ListFooterComponent={renderFooterList}
        ItemSeparatorComponent={() => <Spacer height={16} />}
        renderItem={({item}) => <TokenBalanceItem info={item} />}
      />
    </View>
  )
}

type HeadingListProps = {
  isShowBalanceCard: boolean
  countTokensList: number
  balanceInfo: {
    currentBalance: BigNumber
    oldBalance: BigNumber
    usdExchangeRate: number
    isLoadingBalance: boolean
  }
}
const HeadingList = ({isShowBalanceCard, countTokensList, balanceInfo}: HeadingListProps) => {
  const strings = useStrings()
  const {styles} = useStyles()

  return (
    <View>
      {isShowBalanceCard ? (
        <View>
          <TotalTokensValue
            balance={balanceInfo.currentBalance}
            oldBalance={balanceInfo.oldBalance}
            usdExchangeRate={balanceInfo.usdExchangeRate}
            isLoading={balanceInfo.isLoadingBalance}
            cardType="wallet"
          />

          <Line />
        </View>
      ) : null}

      <Spacer height={16} />

      <Text style={styles.textAvailable}>{strings.tokensAvailable(countTokensList)}</Text>

      <Spacer height={8} />
    </View>
  )
}

const SkeletonItem = () => {
  return (
    <View>
      <TokenBalanceItem />

      <Spacer height={16} />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.px_lg,
      backgroundColor: color.gray_cmin,
    },
    textAvailable: {
      color: color.gray_c700,
      ...atoms.body_2_md_regular,
    },
  })

  return {styles} as const
}
