import React, {memo} from 'react'
import {View} from 'react-native'
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'

const debugStyle = {backgroundColor: 'red', opacity: 0.2}

type Props = {
  height?: number,
  width?: number,
  fill?: boolean,
  style?: ViewStyleProp,
  debug?: boolean,
}

export const Spacer = ({
  height = 16,
  width = 16,
  fill,
  style,
  debug,
}: Props) => <View style={[fill && {flex: 1}, {height, width}, style, debug && debugStyle]} />

export default memo<Props>(Spacer)
