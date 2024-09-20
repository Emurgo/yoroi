import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, useWindowDimensions, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import QRCode from 'react-native-qrcode-svg'

import {YoroiLogoIllustration} from '../../../features/Receive/illustrations/YoroiLogo'
import {Spacer} from '../../Spacer/Spacer'
import {Text} from '../../Text'

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

      <View style={styles.wrapper}>
        <YoroiLogoIllustration height={37} width={35} />

        <Spacer height={16} />

        <View style={styles.addressContainer}>
          <View style={styles.qrCode}>
            <QRCode value={content} size={170} backgroundColor={colors.white} color={colors.black} />
          </View>

          <Spacer height={16} />

          <Text style={[styles.content, {color: colors.transparent}]}>{content}</Text>
        </View>
      </View>
    </View>
  )
}

const useStyles = () => {
  const screenWidth = useWindowDimensions().width
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    qrCode: {
      backgroundColor: color.white_static,
      padding: 10,
      borderRadius: 8,
    },
    addressContainer: {
      alignItems: 'center',
    },
    wrapper: {
      ...atoms.justify_center,
      ...atoms.align_center,
    },
    touchableCard: {
      borderRadius: 10,
      width: screenWidth - 34,
      alignItems: 'center',
      maxHeight: 308,
      flex: 1,
      minHeight: 308,
      alignSelf: 'center',
      overflow: 'hidden',
      paddingVertical: 16,
      gap: 32,
    },
    content: {
      textAlign: 'center',
      maxWidth: 300,
      ...atoms.body_1_lg_regular,
    },
  })

  const colors = {
    white: color.gray_min,
    black: color.gray_max,
    transparent: 'transparent',
    backgroundGradientCard: color.bg_gradient_1,
  }

  return {styles, colors} as const
}
