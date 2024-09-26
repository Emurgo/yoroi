import {useTheme} from '@yoroi/theme'
import {Image} from 'expo-image'
import React from 'react'
import {StyleSheet, View, ViewStyle} from 'react-native'

import {IconProps} from '.'

export const WalletAvatar = ({image = '', size = 40, style}: IconProps & {image?: string; style?: ViewStyle}) => {
  const styles = useStyles()

  return (
    <View style={[styles.defaultStyle, style]}>
      <Image source={{uri: image, width: 64, height: 64}} style={{width: size, height: size}} />
    </View>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    defaultStyle: {
      borderColor: color.gray_max,
      borderRadius: 6,
      borderWidth: 0.5,
      alignItems: 'center',
      justifyContent: 'center',
      aspectRatio: 1,
      overflow: 'hidden',
    },
  })
  return styles
}
