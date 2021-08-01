/* eslint-disable react-native/no-inline-styles */
// @flow

import React from 'react'
import {View} from 'react-native'
import {Text} from '.'

import type {TextStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'

type Props = {
  textRow: string,
  style?: TextStyleProp,
}

const BulletPointItem = ({textRow, style}: Props) => {
  return (
    <View style={{flexDirection: 'row'}}>
      <Text style={[{paddingRight: 8}, style]}>{'\u2022'}</Text>
      <Text style={style}>{textRow}</Text>
    </View>
  )
}

export default BulletPointItem
