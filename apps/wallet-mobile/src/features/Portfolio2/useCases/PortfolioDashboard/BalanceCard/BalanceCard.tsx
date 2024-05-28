import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {useGetPortfolioBalance} from '../../../common/useGetPortfolioBalance'
import {useStrings} from '../../../common/useStrings'
import {BalanceCardContent} from './BalanceCardContent'
import {BalanceCardSkeleton} from './BalanceCardSkeleton'

export const BalanceCard = () => {
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const {data: portfolioData, isLoading} = useGetPortfolioBalance()
  const usdExchangeRate = portfolioData?.usdExchangeRate ?? 1

  const currentBalance = new BigNumber(portfolioData?.currentBalance ?? 0)
  const oldBalance = new BigNumber(portfolioData?.oldBalance ?? 0)

  return (
    <View style={styles.root}>
      {isLoading ? (
        <BalanceCardSkeleton />
      ) : (
        <LinearGradient style={styles.gradientRoot} colors={colors.gradientColor}>
          <BalanceCardContent
            balance={currentBalance}
            oldBalance={oldBalance}
            usdExchangeRate={usdExchangeRate}
            headerCard={
              <View style={styles.rowBetween}>
                <Text style={[styles.textWhite, styles.normalText]}>{strings.totalWalletValue}</Text>

                <Text style={[styles.boxExchange]}>
                  <Text style={[styles.textWhite, styles.normalText]}>1 ADA = </Text>

                  <Text style={[styles.textWhite, styles.normalText, styles.usdExchangeText]}>{usdExchangeRate}</Text>

                  <Text style={[styles.textWhite, styles.usdExchangeFiat]}>USD</Text>
                </Text>
              </View>
            }
          />
        </LinearGradient>
      )}
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.px_lg,
    },
    gradientRoot: {
      ...atoms.p_lg,
      borderRadius: 9,
    },
    textWhite: {
      color: color.white_static,
    },
    normalText: {
      ...atoms.body_2_md_regular,
    },
    rowBetween: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    boxExchange: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    usdExchangeText: {
      ...atoms.font_semibold,
    },
    usdExchangeFiat: {
      ...atoms.body_3_sm_regular,
    },
  })

  const colors = {
    gradientColor: color.bg_gradient_3,
  }

  return {styles, colors} as const
}
