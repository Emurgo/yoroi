import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {PnlTag} from '../PnlTag/PnlTag'
import {useGetPortfolioBalance} from '../useGetPortfolioBalance'
import {useStrings} from '../useStrings'
import {ADABalanceCardSkeleton} from './ADABalanceCardSkeleton'

export const ADABalanceCard = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()
  const {data: portfolioData, isLoading} = useGetPortfolioBalance()
  const exchangeRate = portfolioData?.exchangeRate ?? 0

  const currentADABalance = new BigNumber(portfolioData?.currentADABalance ?? 0)
  const oldADABalance = new BigNumber(portfolioData?.oldADABalance ?? 0)

  const currentUSDABalance = currentADABalance.multipliedBy(exchangeRate)
  const oldUSDBalance = oldADABalance.multipliedBy(exchangeRate)

  const formatADABalance = currentADABalance.toFixed(2)
  const formatUSDBalance = currentUSDABalance.toFixed(2)

  const pnl = currentUSDABalance.minus(oldUSDBalance)
  const variantPnl = new BigNumber(pnl).gte(0) ? 'success' : 'danger'
  const pnlPercentFormat = currentUSDABalance.minus(oldUSDBalance).dividedBy(oldUSDBalance).multipliedBy(100).toFixed(2)
  const pnlNumber = currentUSDABalance.minus(oldUSDBalance)
  const pnlNumberFormat = pnlNumber.gte(0) ? `+${pnlNumber.toFixed(2)}` : `${pnlNumber.toFixed(2)}`

  return (
    <View style={styles.root}>
      {isLoading ? (
        <ADABalanceCardSkeleton />
      ) : (
        <LinearGradient style={styles.gradientRoot} colors={colors.gradientColor}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[styles.textWhite, styles.normalText]}>{strings.totalWalletValue}</Text>
            </View>

            <Text style={[styles.boxExchange]}>
              <Text style={[styles.textWhite, styles.normalText]}>1 ADA = </Text>

              <Text style={[styles.textWhite, styles.normalText, styles.usdExchangeText]}>0,48</Text>

              <Text style={[styles.textWhite, styles.usdExchangeFiat]}>USD</Text>
            </Text>
          </View>

          <View style={styles.balanceContainer}>
            <View style={[styles.adaBalanceBox]}>
              <Text style={[styles.adaBalanceText, styles.textWhite]}>{formatADABalance}</Text>

              <Text style={[styles.adaSymbol, styles.textWhite]}>ADA</Text>
            </View>

            <View style={styles.rowBetween}>
              <Text style={[styles.textWhite, styles.usdBalance]}>{formatUSDBalance} USD</Text>

              <View style={styles.varyContainer}>
                <PnlTag variant={variantPnl} withIcon>
                  <Text>{pnlPercentFormat}%</Text>
                </PnlTag>

                <PnlTag variant={variantPnl}>
                  <Text>{pnlNumberFormat} USD</Text>
                </PnlTag>
              </View>
            </View>
          </View>
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
      backgroundColor: color.gray_cmin,
      ...atoms.p_lg,
      borderRadius: 9,
      gap: 6,
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
    adaBalanceBox: {
      ...atoms.flex_row,
      ...atoms.gap_2xs,
      ...atoms.align_baseline,
    },
    adaBalanceText: {
      ...atoms.heading_1_regular,
      ...atoms.font_semibold,
    },
    adaSymbol: {
      ...atoms.body_1_lg_regular,
      ...atoms.font_semibold,
    },
    balanceContainer: {
      ...atoms.gap_2xs,
    },
    usdBalance: {
      ...atoms.body_2_md_regular,
    },
    varyContainer: {
      ...atoms.flex_row,
      ...atoms.gap_xs,
      ...atoms.align_stretch,
    },
  })

  const colors = {
    gradientColor: color.bg_gradient_3,
  }

  return {styles, colors} as const
}
