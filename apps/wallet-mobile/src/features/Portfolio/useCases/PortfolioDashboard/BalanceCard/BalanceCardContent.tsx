import {amountBreakdown, amountFormatter} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {useCurrencyContext} from '../../../../Settings/Currency'
import {usePrivacyMode} from '../../../../Settings/PrivacyMode/PrivacyMode'
import {PnlTag} from '../../../common/PnlTag/PnlTag'
import {useGetQuantityChange} from '../../../common/useGetQuantityChange'
import {useQuantityChange} from '../../../common/useQuantityChange'

type Props = {
  amount: Portfolio.Token.Amount
  headerCard: React.ReactNode
  name: string
}

export const BalanceCardContent = ({amount, headerCard, name}: Props) => {
  const {styles} = useStyles()
  const {isPrivacyActive, setPrivacyModeOff, setPrivacyModeOn} = usePrivacyMode()

  const quantityChangeData = useGetQuantityChange({name, quantity: amount.quantity})
  const {previousQuantity} = quantityChangeData ?? {}

  const {quantityChange, variantPnl, quantityChangePercent, pairedBalanceChange} = useQuantityChange({
    quantity: amount.quantity,
    previousQuantity,
    decimals: amount.info.decimals,
  })

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
            <PairedBalance amount={amount} textStyle={styles.usdBalance} />
          </TouchableOpacity>

          <View style={styles.varyContainer}>
            <PnlPercentChange variantPnl={variantPnl} quantityChangePercent={quantityChangePercent} />

            <PnlPairedChange
              variantPnl={variantPnl}
              quantityChange={quantityChange}
              pairedBalanceChange={pairedBalanceChange}
            />
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

      <Text style={[styles.adaSymbol, styles.textWhite]}>{amount.info.ticker}</Text>
    </View>
  )
}

type PnlPercentChangeProps = {variantPnl: 'danger' | 'success' | 'neutral'; quantityChangePercent: string}
const PnlPercentChange = ({variantPnl, quantityChangePercent}: PnlPercentChangeProps) => {
  return (
    <PnlTag variant={variantPnl} withIcon>
      <Text>{quantityChangePercent}%</Text>
    </PnlTag>
  )
}

type PnlPairedChangeProps = {
  variantPnl: 'danger' | 'success' | 'neutral'
  quantityChange?: bigint
  pairedBalanceChange: string
}
const PnlPairedChange = ({variantPnl, quantityChange, pairedBalanceChange}: PnlPairedChangeProps) => {
  const {currency} = useCurrencyContext()

  return (
    <PnlTag variant={variantPnl}>
      <Text>{`${Number(quantityChange) > 0 ? '+' : ''}${pairedBalanceChange} ${currency}`}</Text>
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
      ...atoms.heading_1_regular,
      ...atoms.font_semibold,
    },
    adaSymbol: {
      ...atoms.body_1_lg_regular,
      ...atoms.font_semibold,
    },
    balanceContainer: {
      ...atoms.gap_2xs,
      ...atoms.flex_col,
      ...atoms.align_start,
    },
    usdBalance: {
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
