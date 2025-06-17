import {atoms as a, useTheme} from '@yoroi/theme'

import {Image} from 'expo-image'
import * as React from 'react'
import {StyleProp, View, ViewStyle} from 'react-native'

import {IconProps} from './type'

export const WalletAvatar = ({
  image = '',
  size = 40,
  style,
}: IconProps & {image?: string; style?: StyleProp<ViewStyle>}) => {
  const {palette: p} = useTheme()

  return (
    <View
      style={[
        a.align_center,
        a.justify_center,
        a.overflow_hidden,
        {
          borderColor: p.gray_max,
          borderRadius: 6,
          borderWidth: 0.5,
          aspectRatio: 1,
        },
        style,
      ]}
    >
      <Image
        source={{uri: image, width: 64, height: 64}}
        style={{width: size, height: size}}
      />
    </View>
  )
}
