import {splitBigInt} from '@yoroi/common'
import {amountFormatter} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {useGetQuantityChange} from '../../../../../features/Portfolio2/common/useGetQuantityChange'
import {useCurrencyContext} from '../../../../../features/Settings/Currency'
import {usePrivacyMode} from '../../../../../features/Settings/PrivacyMode/PrivacyMode'
import {PnlTag} from '../../../common/PnlTag/PnlTag'
import {useQuantityChange} from '../../../common/useQuantityChange'

type Props = {
  amount: Portfolio.Token.Amount
  headerCard: React.ReactNode
  rate: number
  name: string
}

export const BalanceCardContent = ({amount, headerCard, rate, name}: Props) => {
  const {styles} = useStyles()
  const {isPrivacyOff, setPrivacyModeOff, setPrivacyModeOn} = usePrivacyMode()

  const quantityChangeData = useGetQuantityChange({name, quantity: amount.quantity})
  const {previousQuantity} = quantityChangeData ?? {}

  const {quantityChange, variantPnl} = useQuantityChange({quantity: amount.quantity, previousQuantity})

  const togglePrivacyMode = () => {
    if (isPrivacyOff) {
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
            <PnlPercentChange
              previousQuantity={previousQuantity}
              quantityChange={quantityChange}
              variantPnl={variantPnl}
            />

            <PnlPairedChange
              decimalPlaces={amount.info.decimals}
              rate={rate}
              variantPnl={variantPnl}
              quantityChange={quantityChange}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

type BalanceProps = {amount: Portfolio.Token.Amount}
const Balance = ({amount}: BalanceProps) => {
  const {isPrivacyOff, privacyPlaceholder} = usePrivacyMode()
  const {styles} = useStyles()

  const balance = React.useMemo(
    () => (isPrivacyOff ? amountFormatter()(amount) : amountFormatter({template: `${privacyPlaceholder}`})(amount)),
    [amount, isPrivacyOff, privacyPlaceholder],
  )

  return (
    <View style={styles.balanceBox}>
      <Text style={[styles.balanceText, styles.textWhite]}>{balance}</Text>

      <Text style={[styles.adaSymbol, styles.textWhite]}>{amount.info.ticker}</Text>
    </View>
  )
}

type PnlPercentChangeProps = {
  variantPnl: 'danger' | 'success' | 'neutral'
  quantityChange?: bigint
  previousQuantity?: bigint
}
const PnlPercentChange = ({variantPnl, previousQuantity, quantityChange}: PnlPercentChangeProps) => {
  const quantityChangePercent = React.useMemo(() => {
    if (quantityChange === undefined || previousQuantity === undefined || Number(previousQuantity) === 0) return '0.00'
    return ((Number(quantityChange) / Number(previousQuantity)) * 100).toFixed(2)
  }, [previousQuantity, quantityChange])

  return (
    <PnlTag variant={variantPnl} withIcon>
      <Text>{quantityChangePercent}%</Text>
    </PnlTag>
  )
}

type PnlPairedChangeProps = {
  variantPnl: 'danger' | 'success' | 'neutral'
  quantityChange?: bigint
  decimalPlaces: number
  rate: number
}
const PnlPairedChange = ({decimalPlaces, rate, variantPnl, quantityChange}: PnlPairedChangeProps) => {
  const {currency} = useCurrencyContext()

  const pairedBalanceChange = React.useMemo(() => {
    if (quantityChange === undefined) return '0.00'
    return splitBigInt(quantityChange, decimalPlaces).bn.times(rate).toFormat(2)
  }, [decimalPlaces, quantityChange, rate])

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
