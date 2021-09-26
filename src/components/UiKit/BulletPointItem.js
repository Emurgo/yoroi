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
      <Text style={style}>{'\u2022'}</Text>

      <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap', paddingLeft: 8}}>
        <Text style={style}>{textRow}</Text>
      </View>
    </View>
  )
}

export default BulletPointItem
