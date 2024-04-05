import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, useWindowDimensions, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import QRCode from 'react-native-qrcode-svg'

import {Spacer, Text} from '../../../../components'
import {YoroiLogoIllustration} from '../../illustrations/YoroiLogo'

type ShareProps = {
  content: string
}

export const CaptureShareQRCodeCard = ({content}: ShareProps) => {
  const {styles, colors} = useStyles()

  return (
    <View style={styles.touchableCard}>
      <LinearGradient
        style={[StyleSheet.absoluteFill, {opacity: 1}]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        colors={colors.backgroundGradientCard}
      />

      <Spacer height={16} />

      <View style={styles.addressContainer}>
        <View style={styles.qrCode}>
          <QRCode value={content} size={158} color={colors.black} />
        </View>

        <Spacer height={16} />

        <Text style={[styles.content, {color: colors.transparent}]}>{content}</Text>
      </View>
    </View>
  )
}

const useStyles = () => {
  const screenWidth = useWindowDimensions().width
  const {theme} = useTheme()

  const styles = StyleSheet.create({
    qrCode: {
      backgroundColor: theme.color.gray.min,
      padding: 10,
      borderRadius: 8,
    },
    addressContainer: {
      alignItems: 'center',
    },
    touchableCard: {
      borderRadius: 10,
      width: screenWidth - 34,
      alignItems: 'center',
      maxHeight: 308,
      flex: 1,
      minHeight: 394,
      alignSelf: 'center',
      overflow: 'hidden',
      paddingVertical: 15,
      gap: 32,
      justifyContent: 'center',
    },
    content: {
      textAlign: 'center',
      maxWidth: 300,
      ...theme.typography['body-1-l-regular'],
    },
  })

  const colors = {
    black: theme.color.gray.max,
    transparent: 'transparent',
    backgroundGradientCard: theme.color.gradients['blue-green'],
  }

  return {styles, colors} as const
}
