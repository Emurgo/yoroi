import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../components'
import {PnlTag} from '../PnlTag/PnlTag'

type Props = {
  balance: BigNumber
  oldBalance: BigNumber
  usdExchangeRate: number
  headerCard: React.ReactNode
  cardType: 'wallet' | 'dapps'
}

export const TotalTokensValueContent = ({balance, oldBalance, usdExchangeRate, headerCard, cardType}: Props) => {
  const {styles} = useStyles()

  const isWallet = cardType === 'wallet'
  const formatBalance = balance.toFixed(2)
  const currentUSDBalance = balance.multipliedBy(usdExchangeRate)
  const oldUSDBalance = oldBalance.multipliedBy(usdExchangeRate)

  const formatUSDBalance = currentUSDBalance.toFixed(2)

  const pnl = currentUSDBalance.minus(oldUSDBalance)
  const variantPnl = new BigNumber(pnl).gte(0) ? 'success' : 'danger'
  const pnlPercentFormat = balance.minus(oldBalance).dividedBy(oldBalance).multipliedBy(100).toFixed(2)
  const pnlNumber = currentUSDBalance.minus(oldUSDBalance)
  const pnlNumberFormat = pnlNumber.gte(0) ? `+${pnlNumber.toFixed(2)}` : `${pnlNumber.toFixed(2)}`

  return (
    <View>
      {headerCard}

      <Spacer height={6} />

      <View style={styles.balanceContainer}>
        <View style={[styles.balanceBox]}>
          <Text style={[styles.balanceText]}>{formatBalance}</Text>

          <Text style={[styles.adaSymbol]}>ADA</Text>

          {isWallet ? <Text style={[styles.usdSymbol]}>/USD</Text> : null}
        </View>

        <View style={styles.rowBetween}>
          <Text style={[styles.usdBalance]}>{formatUSDBalance} USD</Text>

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
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    rowBetween: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    balanceBox: {
      ...atoms.flex_row,
      ...atoms.gap_2xs,
      ...atoms.align_baseline,
    },
    balanceText: {
      ...atoms.heading_1_regular,
      ...atoms.font_semibold,
    },
    adaSymbol: {
      ...atoms.body_1_lg_regular,
      ...atoms.font_semibold,
    },
    usdSymbol: {
      ...atoms.body_1_lg_regular,
      ...atoms.font_semibold,
      color: color.gray_c400,
    },
    balanceContainer: {
      ...atoms.gap_2xs,
    },
    usdBalance: {
      ...atoms.body_2_md_regular,
      color: color.gray_c600,
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
