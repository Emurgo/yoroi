import {SpacingSize, tokens} from '@yoroi/theme'
import * as React from 'react'
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
  const heightValue = tokens.space[height]
  const widthValue = tokens.space[width]

  return <View style={[fill && {flex: 1}, {height: heightValue, width: widthValue}, style, debug && debugStyle]} />
}
