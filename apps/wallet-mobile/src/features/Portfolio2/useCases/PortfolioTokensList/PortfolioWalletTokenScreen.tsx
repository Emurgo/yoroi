import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {FlatList, StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../components'
import {useSearch} from '../../../../Search/SearchContext'
import {makeList} from '../../../../utils'
import {AssetTokenImage} from '../../common/AssetTokenImage'
import {TokenBalanceItem} from '../../common/TokenBalanceItem/TokenBalanceItem'
import {TotalTokensValue} from '../../common/TotalTokensValue/TotalTokensValue'
import {useGetPortfolioBalance} from '../../common/useGetPortfolioBalance'
import {useGetTokensWithBalance} from '../../common/useGetTokensWithBalance'
import {useStrings} from '../../common/useStrings'

export const PortfolioWalletTokenScreen = () => {
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

    if (isSearching && search?.length > 0) {
      return tokensList.filter((token) => token.symbol.toLowerCase().includes(search.toLowerCase()))
    }

    return tokensList
  }, [isSearching, search, tokensData])

  const renderFooterList = () => {
    if (tokensLoading)
      return makeList(6).map((_, index) => (
        <View key={index}>
          <TokenBalanceItem />

          <Spacer height={16} />
        </View>
      ))

    if (getListTokens.length === 0)
      return (
        <View style={styles.containerAssetToken}>
          <View style={styles.boxAssetToken}>
            <AssetTokenImage />
          </View>

          <Text style={styles.textEmpty}>{strings.noTokensFound}</Text>
        </View>
      )

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

const Line = () => {
  const {styles} = useStyles()
  return <View style={styles.line} />
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.px_lg,
      backgroundColor: color.gray_cmin,
    },
    line: {
      height: 1,
      ...atoms.w_full,
      backgroundColor: color.gray_c200,
    },
    textAvailable: {
      color: color.gray_c700,
      ...atoms.body_2_md_regular,
    },
    boxAssetToken: {
      width: 280,
      height: 280,
      ...atoms.justify_center,
      ...atoms.align_center,
    },
    containerAssetToken: {
      ...atoms.flex_col,
      ...atoms.justify_center,
      ...atoms.align_center,
      ...atoms.w_full,
      ...atoms.gap_lg,
      ...atoms.h_full,
    },
    textEmpty: {
      ...atoms.heading_3_medium,
      ...atoms.font_semibold,
    },
  })

  return {styles} as const
}
