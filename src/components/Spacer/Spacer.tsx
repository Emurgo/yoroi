import React from 'react'
import {View, ViewStyle} from 'react-native'

const debugStyle = {backgroundColor: 'red', opacity: 0.2}

type Props = {
  height?: number
  width?: number
  fill?: boolean
  style?: ViewStyle
  debug?: boolean
}

export const Spacer = ({height = 16, width = 16, fill, style, debug}: Props) => (
  <View style={[fill && {flex: 1}, {height, width}, style, debug && debugStyle]} />
)
