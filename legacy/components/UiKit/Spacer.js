// @flow

import React from 'react'
import {View} from 'react-native'
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'

const debugStyle = {backgroundColor: 'red', opacity: 0.2}

export const Spacer = ({
  height = 16,
  width = 16,
  fill,
  style,
  debug,
}: {
  height?: number,
  width?: number,
  fill?: boolean,
  style?: ViewStyleProp,
  debug?: boolean,
}) => <View style={[fill && {flex: 1}, {height, width}, style, debug && debugStyle]} />

export default Spacer
