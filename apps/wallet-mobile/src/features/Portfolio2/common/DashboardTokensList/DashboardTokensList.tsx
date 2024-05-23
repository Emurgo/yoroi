import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View} from 'react-native'

import {Icon, Spacer} from '../../../../components'
import {makeList} from '../../../../utils'
import {BuyADABanner} from '../BuyADABanner/BuyADABanner'
import {IPortfolioBalance, useGetTokensWithBalance} from '../useGetTokensWithBalance'
import {useNavigateTo} from '../useNavigationTo'
import {useStrings} from '../useStrings'
import {useZeroBalance} from '../useZeroBalance'
import {DashboardTokenItem} from './DashboardTokenItem'
import {TradeTokensBanner} from './TradeTokensBanner'

export const DashboardTokensList = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const navigationTo = useNavigateTo()
  const isZeroADABalance = useZeroBalance()
  const {data, isLoading} = useGetTokensWithBalance()
  const tokensList = data ?? []

  const isJustADA = tokensList.length === 1 && tokensList[0].symbol === 'ADA'

  const handleDirectTokensList = () => {
    navigationTo.tokensList()
  }

  const renderTokenItem = (item: IPortfolioBalance | undefined, index: number) => {
    return (
      <DashboardTokenItem
        key={item?.symbol ?? index}
        tokenInfo={item ? {logo: item.logo, symbol: item.symbol, name: item.name} : undefined}
      />
    )
  }

  const renderFooterList = () => {
    if (isLoading)
      return (
        <View style={styles.containerLoading}>
          {makeList(3).map((_, index) => renderTokenItem(undefined, index))}

          <Spacer width={16} />
        </View>
      )

    return (
      <View style={styles.tradeTokensContainer}>
        {isJustADA && (
          <View style={styles.tradeTokensContainer}>
            <Spacer width={16} />

            <TradeTokensBanner />
          </View>
        )}

        <Spacer width={16} />
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <View style={[styles.container, styles.actionsContainer]}>
        <Text style={styles.title}>{strings.tokens(tokensList.length)}</Text>

        <TouchTokensList onPress={handleDirectTokensList} />
      </View>

      {isZeroADABalance ? (
        <View style={styles.container}>
          <BuyADABanner />
        </View>
      ) : null}

      <FlatList
        horizontal
        data={tokensList}
        ListHeaderComponent={<Spacer width={16} />}
        ListFooterComponent={renderFooterList()}
        ItemSeparatorComponent={() => <Spacer width={8} />}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.symbol}
        renderItem={({item, index}) => renderTokenItem(item, index)}
      />
    </View>
  )
}

const TouchTokensList = ({onPress}: TouchableOpacityProps) => (
  <TouchableOpacity onPress={onPress}>
    <Icon.ArrowRight size={24} />
  </TouchableOpacity>
)

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.px_lg,
    },
    root: {
      ...atoms.flex_col,
      ...atoms.gap_lg,
    },
    actionsContainer: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    title: {
      ...atoms.body_1_lg_medium,
    },
    tradeTokensContainer: {
      ...atoms.flex_row,
      ...atoms.flex_1,
    },
    containerLoading: {
      ...atoms.flex_row,
      ...atoms.gap_sm,
    },
  })

  return {styles} as const
}
