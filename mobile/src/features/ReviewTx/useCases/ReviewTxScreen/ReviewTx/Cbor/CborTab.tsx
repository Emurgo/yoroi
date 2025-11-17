import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {Copiable} from '~/ui/Copiable/Copiable'
import {Space} from '~/ui/Space/Space'

type CborTabProps = {
  cbor: string
}

export const CborTab = ({cbor}: CborTabProps) => {
  const {palette: p} = useTheme()

  return (
    <View style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}>
      <Space.Height.lg />

      <View style={[a.flex_row, a.justify_between]}>
        <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
          CBOR
        </Text>
        <Copiable text={cbor} />
      </View>

      <Space.Height.sm />

      <View style={[{backgroundColor: p.bg_color_min}, a.rounded_sm, a.p_lg]}>
        <Text
          style={[a.body_2_md_regular, {color: p.text_gray_medium}]}
          selectable
        >
          {cbor}
        </Text>
      </View>
    </View>
  )
}
