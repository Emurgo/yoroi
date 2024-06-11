import {Blockies} from '@yoroi/identicon'
import {useTheme} from '@yoroi/theme'
import {Image} from 'expo-image'
import React from 'react'
import {StyleSheet, View, ViewStyle} from 'react-native'

type Props = {
  iconSeed: string
  scalePx?: number
  style?: ViewStyle
}

export const WalletAccount = ({iconSeed, scalePx = 5, style}: Props) => {
  const styles = useStyles()

  const image = React.useMemo(
    () => new Blockies().asBase64({seed: iconSeed, size: 7, scale: scalePx}),
    [iconSeed, scalePx],
  )

  return (
    <View style={[styles.defaultStyle, style]}>
      <Image source={{uri: image}} style={{width: 35, height: 35}} />
    </View>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    defaultStyle: {
      borderColor: color.gray_cmax,
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
