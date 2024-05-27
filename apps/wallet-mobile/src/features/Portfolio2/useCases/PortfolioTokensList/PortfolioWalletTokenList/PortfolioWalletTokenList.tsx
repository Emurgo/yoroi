import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {FlatList, StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {useSearch} from '../../../../../Search/SearchContext'
import {makeList} from '../../../../../utils'
import {Line} from '../../../common/Line'
import {TokenEmptyList} from '../../../common/TokenEmptyList'
import {useGetPortfolioBalance} from '../../../common/useGetPortfolioBalance'
import {useGetTokensWithBalance} from '../../../common/useGetTokensWithBalance'
import {useStrings} from '../../../common/useStrings'
import {TotalTokensValue} from '../TotalTokensValue/TotalTokensValue'
import {TokenBalanceItem} from './TokenBalanceItem'

export const PortfolioWalletTokenList = () => {
  const strings = useStrings()
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
          <View>
            <TotalTokensValue
              balance={currentBalance}
              oldBalance={oldBalance}
              usdExchangeRate={usdExchangeRate}
              isLoading={balanceLoading}
              cardType="wallet"
            />

            <Line />

            <Spacer height={16} />

            <Text style={styles.textAvailable}>{strings.tokensAvailable(getListTokens.length)}</Text>

            <Spacer height={16} />
          </View>
        }
        ItemSeparatorComponent={() => <Spacer height={16} />}
        renderItem={({item}) => <TokenBalanceItem info={item} />}
        ListFooterComponent={renderFooterList}
      />
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
