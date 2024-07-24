import {useTheme} from '@yoroi/theme'
import _ from 'lodash'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import QRCode from 'react-native-qrcode-svg'
import Animated, {FadeInDown, FadeOutDown, Layout} from 'react-native-reanimated'
import Share from 'react-native-share'
import ViewShot, {captureRef} from 'react-native-view-shot'

import {Spacer, Text} from '../'
import {CaptureShareQRCodeCard} from './CaptureShareQRCodeCard/CaptureShareQRCodeCard'

type ShareQRCodeCardProps = {
  content: string
  title: string
  isCopying?: boolean
  onLongPress: () => void
  testId?: string
  onShare?: () => void
  shareLabel: string
  copiedText: string
}

export const ShareQRCodeCard = ({
  content,
  title,
  isCopying,
  onLongPress,
  testId,
  onShare,
  shareLabel,
  copiedText,
}: ShareQRCodeCardProps) => {
  const {styles, colors, qrSize} = useStyles()

  const [isSharing, setIsSharing] = React.useState(false)
  const ref: React.RefObject<ViewShot> = React.useRef(null)

  const handleOnPressShare = () => {
    setIsSharing(true)
    onShare?.()
  }

  React.useEffect(() => {
    if (isSharing) {
      const captureAndShare = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))

        const uri = await captureRef(ref, {
          format: 'png',
          quality: 1,
          fileName: shareLabel,
        })

        setIsSharing(false)
        await Share.open({url: uri, filename: shareLabel, message: content})
      }

      captureAndShare()
    }
  }, [isSharing, shareLabel, content])

  if (isSharing)
    return (
      <ViewShot ref={ref}>
        <CaptureShareQRCodeCard content={content} />
      </ViewShot>
    )

  return (
    <TouchableWithoutFeedback onLongPress={onLongPress}>
      <View>
        <View style={styles.card}>
          <LinearGradient
            style={[StyleSheet.absoluteFill, {opacity: 1, borderRadius: 16}]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={colors.bgCard}
          />

          <Spacer height={16} />

          <Text style={styles.title} testID={`${testId}-title`}>
            {title}
          </Text>

          <Spacer height={16} />

          <View style={styles.addressContainer}>
            <View style={styles.qrCode} testID={`${testId}-qr`}>
              <QRCode value={content} size={qrSize} backgroundColor={colors.white} color={colors.black} />
            </View>

            <Spacer height={16} />

            <Text style={styles.textAddress}>{content}</Text>
          </View>

          <Spacer height={16} />

          <TouchableOpacity activeOpacity={0.5} onPress={handleOnPressShare} onLongPress={onLongPress}>
            <Text style={styles.textShareAddress}>{shareLabel}</Text>
          </TouchableOpacity>

          <Spacer height={16} />
        </View>

        {isCopying && (
          <Animated.View layout={Layout} entering={FadeInDown} exiting={FadeOutDown} style={styles.isCopying}>
            <Text style={styles.copiedText}>{copiedText}</Text>
          </Animated.View>
        )}
      </View>
    </TouchableWithoutFeedback>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const screenWidth = useWindowDimensions().width

  const qrSize = 170

  const styles = StyleSheet.create({
    qrCode: {
      backgroundColor: color.bg_color_high,
      padding: 10,
      borderRadius: 8,
    },
    addressContainer: {
      alignItems: 'center',
    },
    card: {
      alignItems: 'center',
      flex: 1,
      minHeight: 394,
      alignSelf: 'center',
      width: screenWidth - 32,

      paddingHorizontal: 16,
    },
    title: {
      ...atoms.heading_3_medium,
      color: color.gray_cmax,
    },
    textAddress: {
      textAlign: 'center',
      ...atoms.body_2_md_medium,
      color: color.gray_cmax,
    },
    textShareAddress: {
      height: 32,
      textAlignVertical: 'center',
      color: color.gray_c900,
      ...atoms.button_2_md,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    copiedText: {
      color: color.gray_cmin,
      textAlign: 'center',
      padding: 8,
      ...atoms.body_2_md_medium,
    },
    isCopying: {
      position: 'absolute',
      backgroundColor: color.gray_cmax,
      alignItems: 'center',
      justifyContent: 'center',
      bottom: 60,
      alignSelf: 'center',
      borderRadius: 4,
      zIndex: 10,
    },
  })

  const colors = {
    bgCard: color.bg_gradient_1,
    white: color.gray_cmin,
    black: color.gray_cmax,
  }

  return {styles, colors, qrSize} as const
}
