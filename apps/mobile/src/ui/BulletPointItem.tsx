import {atoms as a} from '@yoroi/theme'
import React from 'react'
import {StyleProp, Text, TextStyle, View} from 'react-native'

import {Space} from './Space/Space'

type Props = {
  textRow: string
  style?: StyleProp<TextStyle>
}

export const BulletPointItem = ({textRow, style}: Props) => {
  return (
    <View style={a.flex_row}>
      <Space.Width.sm />

      <Text style={style}>{'\u2022'}</Text>

      <Space.Width.sm />

      <View style={[a.flex_1, a.flex_row, a.flex_wrap]}>
        <Text style={style}>{textRow}</Text>
      </View>
    </View>
  )
}
