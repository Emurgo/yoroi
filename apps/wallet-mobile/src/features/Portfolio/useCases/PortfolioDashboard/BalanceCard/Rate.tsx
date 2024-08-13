import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text} from 'react-native'

import {useCurrencyPairing} from '../../../../Settings/Currency'

type Props = {rate: number; name: string}
export const Rate = ({rate, name}: Props) => {
  const {styles} = useStyles()
  const {currency, config} = useCurrencyPairing()

  return (
    <Text style={[styles.boxExchange]}>
      <Text style={[styles.textWhite, styles.normalText]}>1 {name} = </Text>

      <Text style={[styles.textWhite, styles.normalText, styles.usdExchangeText]}>{rate.toFixed(config.decimals)}</Text>

      <Text style={[styles.textWhite, styles.usdExchangeFiat]}> {currency}</Text>
    </Text>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    textWhite: {
      color: color.white_static,
    },
    normalText: {
      ...atoms.body_2_md_regular,
    },
    boxExchange: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    usdExchangeText: {
      ...atoms.font_semibold,
      ...atoms.body_2_md_medium,
    },
    usdExchangeFiat: {
      ...atoms.body_3_sm_regular,
    },
  })

  return {styles} as const
}
