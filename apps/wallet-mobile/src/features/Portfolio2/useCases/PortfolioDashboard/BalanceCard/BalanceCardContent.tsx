import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {usePrivacyMode} from '../../../../../features/Settings/PrivacyMode/PrivacyMode'
import {PnlTag} from '../../../common/PnlTag/PnlTag'

type Props = {
  balance: BigNumber
  oldBalance: BigNumber
  usdExchangeRate: number
  headerCard: React.ReactNode
}

export const BalanceCardContent = ({balance, oldBalance, usdExchangeRate, headerCard}: Props) => {
  const {styles} = useStyles()
  const {isPrivacyOff, privacyPlaceholder, setPrivacyModeOff, setPrivacyModeOn} = usePrivacyMode({
    decimals: 2,
    numbers: 3,
  })

  const togglePrivacyMode = () => {
    if (isPrivacyOff) {
      setPrivacyModeOn()
    } else {
      setPrivacyModeOff()
    }
  }

  const currentUSDBalance = balance.multipliedBy(usdExchangeRate)
  const oldUSDBalance = oldBalance.multipliedBy(usdExchangeRate)

  const usdBalanceFormatted = React.useMemo(() => {
    return isPrivacyOff ? currentUSDBalance.toFixed(2) : privacyPlaceholder
  }, [currentUSDBalance, isPrivacyOff, privacyPlaceholder])

  const balanceFormatted = React.useMemo(() => {
    return isPrivacyOff ? balance.toFixed(2) : privacyPlaceholder
  }, [balance, isPrivacyOff, privacyPlaceholder])

  const pnl = currentUSDBalance.minus(oldUSDBalance)
  const variantPnl = new BigNumber(pnl).gte(0) ? 'success' : 'danger'
  const pnlPercentFormatted = balance.minus(oldBalance).dividedBy(oldBalance).multipliedBy(100).toFixed(2)
  const pnlNumber = currentUSDBalance.minus(oldUSDBalance)
  const pnlNumberFormatted = pnlNumber.gte(0) ? `+${pnlNumber.toFixed(2)}` : `${pnlNumber.toFixed(2)}`

  return (
    <View>
      {headerCard}

      <Spacer height={6} />

      <View style={styles.balanceContainer}>
        <TouchableOpacity style={styles.balanceBox} onPress={togglePrivacyMode}>
          <Text style={[styles.balanceText, styles.textWhite]}>{balanceFormatted}</Text>

          <Text style={[styles.adaSymbol, styles.textWhite]}>ADA</Text>
        </TouchableOpacity>

        <View style={styles.rowBetween}>
          <TouchableOpacity style={styles.balanceBox} onPress={togglePrivacyMode}>
            <Text style={[styles.textWhite, styles.usdBalance]}>{usdBalanceFormatted} USD</Text>
          </TouchableOpacity>

          <View style={styles.varyContainer}>
            <PnlTag variant={variantPnl} withIcon>
              <Text>{pnlPercentFormatted}%</Text>
            </PnlTag>

            <PnlTag variant={variantPnl}>
              <Text>{pnlNumberFormatted} USD</Text>
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
    textWhite: {
      color: color.white_static,
    },
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
