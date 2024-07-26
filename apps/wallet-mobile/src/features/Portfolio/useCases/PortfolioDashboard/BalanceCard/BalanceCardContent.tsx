import {amountBreakdown, amountFormatter} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {useCurrencyPairing} from '../../../../Settings/Currency'
import {usePrivacyMode} from '../../../../Settings/PrivacyMode/PrivacyMode'
import {priceDifference} from '../../../common/helpers/priceDifference'
import {PnlTag} from '../../../common/PnlTag/PnlTag'

type Props = {
  amount: Portfolio.Token.Amount
  headerCard: React.ReactNode
}

export const BalanceCardContent = ({amount, headerCard}: Props) => {
  const {styles} = useStyles()
  const {isPrivacyActive, setPrivacyModeOff, setPrivacyModeOn} = usePrivacyMode()

  const {price, previous} = useCurrencyPairing().adaPrice

  const {difference, change, variantPnl} = priceDifference(previous, price)

  const togglePrivacyMode = () => {
    if (isPrivacyActive === true) {
      setPrivacyModeOn()
    } else {
      setPrivacyModeOff()
    }
  }

  return (
    <View>
      {headerCard}

      <Spacer height={6} />

      <View style={styles.balanceContainer}>
        <TouchableOpacity onPress={togglePrivacyMode}>
          <Balance amount={amount} />
        </TouchableOpacity>

        <View style={styles.rowBetween}>
          <TouchableOpacity style={styles.balanceBox} onPress={togglePrivacyMode}>
            <PairedBalance amount={amount} textStyle={styles.pairBalance} />
          </TouchableOpacity>

          <View style={styles.varyContainer}>
            <PnlPercentChange variantPnl={variantPnl} change={change} />

            <PnlPairedChange variantPnl={variantPnl} difference={difference} />
          </View>
        </View>
      </View>
    </View>
  )
}

type BalanceProps = {amount: Portfolio.Token.Amount}
const Balance = ({amount}: BalanceProps) => {
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const {styles} = useStyles()

  const balance = React.useMemo(
    () =>
      isPrivacyActive === false
        ? amountBreakdown(amount).bn.toFormat(2)
        : amountFormatter({template: `${privacyPlaceholder}`})(amount),
    [amount, isPrivacyActive, privacyPlaceholder],
  )

  return (
    <View style={styles.balanceBox}>
      <Text style={[styles.balanceText, styles.textWhite]}>{balance}</Text>

      <Text style={[styles.symbol, styles.textWhite]}>{amount.info.ticker}</Text>
    </View>
  )
}

type PnlPercentChangeProps = {variantPnl: 'danger' | 'success' | 'neutral'; change: string}
const PnlPercentChange = ({variantPnl, change}: PnlPercentChangeProps) => {
  return (
    <PnlTag variant={variantPnl} withIcon>
      <Text>{change}%</Text>
    </PnlTag>
  )
}

type PnlPairedChangeProps = {
  variantPnl: 'danger' | 'success' | 'neutral'
  difference: string
}
const PnlPairedChange = ({variantPnl, difference}: PnlPairedChangeProps) => {
  const {currency} = useCurrencyPairing()

  return (
    <PnlTag variant={variantPnl}>
      <Text>{`${Number(difference) > 0 ? '+' : ''}${difference} ${currency}`}</Text>
    </PnlTag>
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
      ...atoms.w_full,
    },
    balanceBox: {
      ...atoms.flex_row,
      ...atoms.gap_2xs,
      ...atoms.align_baseline,
    },
    balanceText: {
      ...atoms.heading_1_medium,
      ...atoms.font_semibold,
    },
    symbol: {
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
    },
    balanceContainer: {
      ...atoms.gap_2xs,
      ...atoms.flex_col,
      ...atoms.align_start,
    },
    pairBalance: {
      ...atoms.body_2_md_regular,
      color: color.white_static,
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
