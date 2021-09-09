// @flow

import React from 'react'
import {View} from 'react-native'

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'

export const Spacer = ({
  height,
  width,
  fill,
  style,
  debug,
}: {
  height?: number,
  width?: number,
  fill?: boolean,
  style?: ViewStyleProp,
  debug?: boolean,
  // eslint-disable-next-line react-native/no-inline-styles
}) => <View style={[fill ? {flex: 1} : {height, width}, style, debug && {borderColor: 'red', borderWidth: 1}]} />

export default Spacer
