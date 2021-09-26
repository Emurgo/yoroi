// @flow

import React from 'react'
import {View} from 'react-native'

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'

export const Spacer = ({
  height = 16,
  width = 16,
  style,
  debug,
}: {
  height?: number,
  width?: number,
  style?: ViewStyleProp,
  debug?: boolean,
  // eslint-disable-next-line react-native/no-inline-styles
}) => <View style={[{height, width}, style, debug && {backgroundColor: 'red', opacity: 0.2}]} />

export default Spacer
