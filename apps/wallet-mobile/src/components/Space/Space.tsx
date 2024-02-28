import React from 'react'
import {View, ViewStyle} from 'react-native'

// TODO import this form theme dirrectly is is approved
type SpacingKey = 'none' | 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl'
const baseSpace: Record<SpacingKey, number> = {
  none: 0,
  xxs: 2,
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
}

const debugStyle = {backgroundColor: 'red', opacity: 0.2}

type Props = {
  height?: SpacingKey
  width?: SpacingKey
  fill?: boolean
  style?: ViewStyle
  debug?: boolean
}

export const Space = ({height = 's', width = 's', fill, style, debug}: Props) => {
  const heightValue = baseSpace[height]
  const widthValue = baseSpace[width]

  return <View style={[fill && {flex: 1}, {height: heightValue, width: widthValue}, style, debug && debugStyle]} />
}
