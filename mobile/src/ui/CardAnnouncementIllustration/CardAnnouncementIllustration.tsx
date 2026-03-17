import {Image} from 'expo-image'
import * as React from 'react'
import {ImageStyle, StyleProp} from 'react-native'

import cardanoCardSource from '~/assets/img/illustration-cardano-card.png'

export const CardAnnouncementIllustration = ({
  width = 280,
  height = 280,
  style,
}: {
  width?: number
  height?: number
  style?: StyleProp<ImageStyle>
}) => {
  return (
    <Image
      source={cardanoCardSource}
      style={[{width, height}, style]}
      contentFit="contain"
    />
  )
}
