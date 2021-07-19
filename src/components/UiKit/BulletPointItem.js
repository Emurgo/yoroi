// @flow

import React from 'react'
import {Text} from '.'

import type {TextStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'

type Props = {
  textRow: string,
  style?: TextStyleProp,
}

const BulletPointItem = ({textRow, style}: Props) => {
  return (
    <Text style={style}>
      {'\u2022'} {textRow}
    </Text>
  )
}

export default BulletPointItem
