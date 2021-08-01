// @flow

import React from 'react'
import {View} from 'react-native'

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'

export const Spacer = ({
  height,
  width,
  style,
  debug,
}: {
  height?: number,
  width?: number,
  style?: ViewStyleProp,
  debug?: boolean,
  // eslint-disable-next-line react-native/no-inline-styles
}) => <View style={[{height, width}, style, debug && {borderColor: 'red', borderWidth: 1}]} />

export default Spacer
