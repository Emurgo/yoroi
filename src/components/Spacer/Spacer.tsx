import React from 'react'
import {View, ViewStyle} from 'react-native'

const debugStyle = {
  backgroundColor: 'red',
  opacity: 0.4,
  minHeight: 1,
  minWwidth: 1,
}

type Props = {
  height?: number
  width?: number
  fill?: boolean
  style?: ViewStyle
  debug?: boolean
}

export const Spacer = ({height, width, fill, style, debug}: Props) => (
  <View style={[fill && {flex: 1}, {height, width}, style, __DEV__ && debug && debugStyle]} />
)
