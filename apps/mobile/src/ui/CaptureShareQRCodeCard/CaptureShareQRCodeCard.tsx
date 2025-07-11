import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, useWindowDimensions, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import QRCode from 'react-native-qrcode-svg'

import {Spacer} from '../Space/Space'
import {Text} from '../Text/Text'
import {YoroiLogoIllustration} from '../YoroiLogoIllustration/YoroiLogoIllustration'

type ShareProps = {
  content: string
}

export const CaptureShareQRCodeCard = ({content}: ShareProps) => {
  const {color} = useTheme()
  const screenWidth = useWindowDimensions().width

  return (
    <View style={[styles.touchableCard, {width: screenWidth - 34}]}>
      <LinearGradient
        style={[StyleSheet.absoluteFill, {opacity: 1}]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        colors={color.bg_gradient_1}
      />

      <Spacer height={16} />

      <View style={styles.wrapper}>
        <YoroiLogoIllustration height={37} width={35} />

        <Spacer height={16} />

        <View style={styles.addressContainer}>
          <View style={[styles.qrCode, {backgroundColor: color.white_static}]}>
            <QRCode
              value={content}
              size={170}
              backgroundColor={color.white_static}
              color={color.black_static}
            />
          </View>

          <Spacer height={16} />

          <Text style={[styles.content, {color: 'transparent'}]}>
            {content}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  qrCode: {
    padding: 10,
    borderRadius: 8,
  },
  addressContainer: {
    alignItems: 'center',
  },
  wrapper: {
    ...a.justify_center,
    ...a.align_center,
  },
  touchableCard: {
    borderRadius: 10,
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
    ...a.body_1_lg_regular,
  },
})
