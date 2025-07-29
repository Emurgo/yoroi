import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text} from 'react-native'

import {useCurrencyPairing} from '~/features/Settings/useCases/changeAppSettings/Currency/CurrencyContext'

type Props = {rate: number; name: string}
export const Rate = ({rate, name}: Props) => {
  const {palette: p} = useTheme()
  const {currency, config} = useCurrencyPairing()

  return (
    <Text style={[a.flex_row, a.align_center]}>
      <Text style={[a.body_2_md_regular, {color: p.white_static}]}>
        1 {name} ={' '}
      </Text>

      <Text
        style={[
          a.body_2_md_regular,
          a.font_semibold,
          a.body_2_md_medium,
          {color: p.white_static},
        ]}
      >
        {rate.toFixed(config.decimals)}
      </Text>

      <Text style={[a.body_3_sm_regular, {color: p.white_static}]}>
        {' '}
        {currency}
      </Text>
    </Text>
  )
}
