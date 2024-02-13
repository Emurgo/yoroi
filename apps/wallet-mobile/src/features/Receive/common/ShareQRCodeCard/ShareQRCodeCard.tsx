import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, useWindowDimensions, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import QRCode from 'react-native-qrcode-svg'
import Animated, {FadeInDown, FadeOutDown, Layout} from 'react-native-reanimated'
import Share from 'react-native-share'
import ViewShot, {captureRef} from 'react-native-view-shot'

import {Text} from '../../../../components'
import {CaptureShareQRCodeCard} from '../CaptureShareQRCodeCard/CaptureShareQRCodeCard'
import {mocks} from '../mocks'
import {useStrings} from '../useStrings'

type ShareProps = {
  address?: string
  title?: string
  addressDetails?: AddressDetailsProps
  isCopying?: boolean
  onLongPress?: () => void
}

type AddressDetailsProps = {
  address: string
  stakingHash?: string
  spendingHash?: string
  title?: string
}

export const ShareQRCodeCard = ({address, title, isCopying, onLongPress}: ShareProps) => {
  const [isSharing, setIsSharing] = React.useState<boolean>(false)
  const strings = useStrings()
  const ref: React.RefObject<ViewShot> = React.useRef(null)

  const {styles, colors} = useStyles()

  const shareImage = () => {
    setIsSharing(true)
  }

  React.useEffect(() => {
    if (isSharing) {
      const captureAndShare = async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 50))

          const uri = await captureRef(ref, {
            format: 'png',
            quality: 1,
            fileName: mocks.shareFileName,
          })

          setIsSharing(false)
          await Share.open({url: uri, filename: mocks.shareFileName, message: `${strings.address} ${address}`})
        } finally {
          setIsSharing(false)
        }
      }

      captureAndShare()
    }
  }, [address, isSharing, strings.address])

  if (isSharing)
    return (
      <ViewShot ref={ref}>
        <CaptureShareQRCodeCard address={address} />
      </ViewShot>
    )

  if (!isSharing)
    return (
      <View style={styles.card}>
        <LinearGradient
          style={[StyleSheet.absoluteFill, {opacity: 1}]}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          colors={colors.bgCard}
        />

        <Text style={styles.title}>{title}</Text>

        <View style={styles.addressContainer}>
          <View style={styles.qrCode}>
            <QRCode value={address} size={158} backgroundColor={colors.white} color={colors.black} />
          </View>

          <Text style={styles.textAddress}>{address}</Text>
        </View>

        <TouchableOpacity activeOpacity={0.5} onPress={shareImage} onLongPress={onLongPress}>
          <Text style={styles.textShareAddress}>{strings.shareLabel}</Text>
        </TouchableOpacity>

        {isCopying && (
          <Animated.View layout={Layout} entering={FadeInDown} exiting={FadeOutDown} style={styles.isCopying}>
            <Text style={styles.copiedText}>{strings.addressCopiedMsg}</Text>
          </Animated.View>
        )}
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
    card: {
      borderRadius: 16,
      width: SCREEN_WIDTH - 34,
      alignItems: 'center',
      maxHeight: 458,
      height: '100%',
      minHeight: 394,
      alignSelf: 'center',
      overflow: 'hidden',
      paddingVertical: 16,
      gap: 32,
      paddingTop: 32,
    },
    title: {
      fontSize: 20,
      fontWeight: '500',
      fontFamily: 'Rubik-Medium',
      lineHeight: 30,
    },
    textAddress: {
      textAlign: 'center',
      fontWeight: '500',
      paddingHorizontal: 16,
      fontFamily: 'Rubik-Medium',
      fontSize: 14,
      lineHeight: 22,
      color: theme.color['black-static'],
    },
    textShareAddress: {
      fontWeight: '500',
      padding: 4,
      textTransform: 'uppercase',
      fontFamily: 'Rubik-Medium',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.5,
    },
    copiedText: {
      color: theme.color['white-static'],
      textAlign: 'center',
      padding: 8,
      fontSize: 14,
      fontWeight: '500',
      fontFamily: 'Rubik-Medium',
    },
    isCopying: {
      position: 'absolute',
      backgroundColor: theme.color['black-static'],
      alignItems: 'center',
      justifyContent: 'center',
      bottom: 60,
      alignSelf: 'center',
      borderRadius: 4,
      zIndex: 10,
    },
  })

  const colors = {
    bgCard: theme.color.gradients['blue-green'],
    white: theme.color['white-static'],
    black: theme.color['black-static'],
  }

  return {styles, colors} as const
}
