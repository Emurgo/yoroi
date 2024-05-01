import {baseSpace, SpacingSize} from '@yoroi/theme'
import React from 'react'
import {View, ViewStyle} from 'react-native'

const debugStyle = {backgroundColor: 'red', opacity: 0.2}

type Props = {
  height?: SpacingSize
  width?: SpacingSize
  fill?: boolean
  style?: ViewStyle
  debug?: boolean
}

export const Space = ({height = 'sm', width = 'sm', fill, style, debug}: Props) => {
  const heightValue = baseSpace[height]
  const widthValue = baseSpace[width]

  return <View style={[fill && {flex: 1}, {height: heightValue, width: widthValue}, style, debug && debugStyle]} />
}
