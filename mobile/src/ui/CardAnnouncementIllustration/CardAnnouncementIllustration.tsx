import {Image} from 'expo-image'
import * as React from 'react'
import {ImageStyle, StyleProp} from 'react-native'

import appScreenshotSource from '~/assets/img/illustration-app-screenshot.png'

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
      source={appScreenshotSource}
      style={[{width, height}, style]}
      contentFit="contain"
    />
  )
}
