import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, useWindowDimensions, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import QRCode from 'react-native-qrcode-svg'

import {Text} from '../../../../components'
import {YoroiLogoIllustration} from '../../illustrations/YoroiLogo'

type ShareProps = {
  address?: string
  title?: string
  addressDetails?: AddressDetailsProps
}

type AddressDetailsProps = {
  address: string
  stakingHash?: string
  spendingHash?: string
  title?: string
}

export const CaptureShareQRCodeCard = ({address}: ShareProps) => {
  const logoWidth = 35
  const logoHeight = 37

  const {styles, colors} = useStyles()

  return (
    <View style={[styles.touchableCard]}>
      <LinearGradient
        style={[StyleSheet.absoluteFill, {opacity: 1}]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        colors={colors.backgroundGradientCard}
      />

      <YoroiLogoIllustration height={logoHeight} width={logoWidth} />

      <View style={styles.addressContainer}>
        <View style={styles.qrCode}>
          <QRCode value={address} size={158} color={colors.black} />
        </View>

        <Text style={[styles.textAddress, {color: colors.transparent}]}>{address}</Text>
      </View>
    </View>
  )
}

const useStyles = () => {
  const SCREEN_WIDTH = useWindowDimensions().width
  const {theme} = useTheme()

  const styles = StyleSheet.create({
    qrCode: {
      backgroundColor: theme.color['white-static'],
      padding: 10,
      borderRadius: 8,
      marginBottom: 16,
    },
    addressContainer: {
      alignItems: 'center',
    },
    touchableCard: {
      borderRadius: 10,
      width: SCREEN_WIDTH - 34,
      alignItems: 'center',
      maxHeight: 458,
      flex: 1,
      minHeight: 394,
      alignSelf: 'center',
      overflow: 'hidden',
      paddingVertical: 15,
      gap: 32,
      justifyContent: 'center',
    },
    textAddress: {
      textAlign: 'center',
      fontWeight: '500',
      maxWidth: 300,
    },
  })

  const colors = {
    black: theme.color['black-static'],
    transparent: 'transparent',
    backgroundGradientCard: theme.color.gradients['blue-green'],
  }

  return {styles, colors} as const
}
