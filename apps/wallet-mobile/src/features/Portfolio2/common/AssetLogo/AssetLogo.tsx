import * as React from 'react'
import {Image, ImageSourcePropType, ImageStyle, StyleProp} from 'react-native'

type Props = {
  source: string | ImageSourcePropType
  style: StyleProp<ImageStyle>
}
export const AssetLogo = ({source, style}: Props) => {
  return <Image source={typeof source === 'string' ? {uri: source} : source} style={[style]} />
}
