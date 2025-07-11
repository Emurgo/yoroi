import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text} from 'react-native'

import {useCurrencyPairing} from '../../../../features/Settings/useCases/changeAppSettings/Currency/CurrencyContext'

type Props = {rate: number; name: string}
export const Rate = ({rate, name}: Props) => {
  const {color} = useTheme()
  const {currency, config} = useCurrencyPairing()

  return (
    <Text style={styles.boxExchange}>
      <Text style={[styles.normalText, {color: color.white_static}]}>
        1 {name} ={' '}
      </Text>

      <Text
        style={[
          styles.normalText,
          styles.usdExchangeText,
          {color: color.white_static},
        ]}
      >
        {rate.toFixed(config.decimals)}
      </Text>

      <Text style={[styles.usdExchangeFiat, {color: color.white_static}]}>
        {' '}
        {currency}
      </Text>
    </Text>
  )
}

const styles = StyleSheet.create({
  normalText: {
    ...a.body_2_md_regular,
  },
  boxExchange: {
    ...a.flex_row,
    ...a.align_center,
  },
  usdExchangeText: {
    ...a.font_semibold,
    ...a.body_2_md_medium,
  },
  usdExchangeFiat: {
    ...a.body_3_sm_regular,
  },
})
