import {useTheme} from '@yoroi/theme'
import _ from 'lodash'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import QRCode from 'react-native-qrcode-svg'
import Animated, {FadeInDown, FadeOutDown, Layout} from 'react-native-reanimated'
import Share from 'react-native-share'
import ViewShot, {captureRef} from 'react-native-view-shot'

import {Spacer, Text} from '../../../../components'
import {useMetrics} from '../../../../metrics/metricsManager'
import {CaptureShareQRCodeCard} from '../CaptureShareQRCodeCard/CaptureShareQRCodeCard'
import {useStrings} from '../useStrings'

type ShareQRCodeCardProps = {
  content: string
  title: string
  isCopying?: boolean
  onLongPress: () => void
}

export const ShareQRCodeCard = ({content, title, isCopying, onLongPress}: ShareQRCodeCardProps) => {
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const {track} = useMetrics()

  const [isSharing, setIsSharing] = React.useState(false)
  const ref: React.RefObject<ViewShot> = React.useRef(null)

  const handleOnPressShare = () => {
    track.receiveShareAddressClicked()
    setIsSharing(true)
  }
  const message = `${strings.address} ${content}`
  React.useEffect(() => {
    if (isSharing) {
      const captureAndShare = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))

        const uri = await captureRef(ref, {
          format: 'png',
          quality: 1,
          fileName: strings.shareLabel,
        })

        setIsSharing(false)
        await Share.open({url: uri, filename: strings.shareLabel, message})
      }

      captureAndShare()
    }
  }, [isSharing, strings.address, strings.shareLabel, content, message])

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
            style={[StyleSheet.absoluteFill, {opacity: 1}]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={colors.bgCard}
          />

          <Text style={styles.title}>{title}</Text>

          <View style={styles.addressContainer}>
            <View style={styles.qrCode}>
              <QRCode value={content} size={158} backgroundColor={colors.white} color={colors.black} />
            </View>

            <Spacer height={16} />

            <Text style={styles.textAddress}>{content}</Text>
          </View>

          <TouchableOpacity activeOpacity={0.5} onPress={handleOnPressShare} onLongPress={onLongPress}>
            <Text style={styles.textShareAddress}>{strings.shareLabel}</Text>
          </TouchableOpacity>
        </View>

        {isCopying && (
          <Animated.View layout={Layout} entering={FadeInDown} exiting={FadeOutDown} style={styles.isCopying}>
            <Text style={styles.copiedText}>{strings.addressCopiedMsg}</Text>
          </Animated.View>
        )}
      </View>
    </TouchableWithoutFeedback>
  )
}

const useStyles = () => {
  const {width: screenWidth, height: screenHeight} = useWindowDimensions()
  const {theme} = useTheme()
  const {color, typography} = theme

  const heightBreakpointLarge = 800
  const cardSpacing = screenHeight > heightBreakpointLarge ? 32 : 16

  const styles = StyleSheet.create({
    qrCode: {
      backgroundColor: theme.color.gray.min,
      padding: 10,
      borderRadius: 8,
    },
    addressContainer: {
      alignItems: 'center',
    },
    card: {
      borderRadius: 16,
      width: screenWidth - 34,
      alignItems: 'center',
      maxHeight: 458,
      flex: 1,
      minHeight: 394,
      alignSelf: 'center',
      overflow: 'hidden',
      paddingVertical: cardSpacing,
      gap: cardSpacing,
    },
    title: {
      ...typography['heading-3-medium'],
      color: color.gray.max,
    },
    textAddress: {
      textAlign: 'center',
      paddingHorizontal: 16,
      ...typography['body-2-m-medium'],
      color: color.gray.max,
    },
    textShareAddress: {
      color: color.gray.max,
      ...typography['body-2-m-medium'],
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    copiedText: {
      color: color.gray.min,
      textAlign: 'center',
      padding: 8,
      ...typography['body-2-m-medium'],
    },
    isCopying: {
      position: 'absolute',
      backgroundColor: color.gray.max,
      alignItems: 'center',
      justifyContent: 'center',
      bottom: 60,
      alignSelf: 'center',
      borderRadius: 4,
      zIndex: 10,
    },
  })

  const colors = {
    bgCard: color.gradients['blue-green'],
    white: color.gray.min,
    black: color.gray.max,
  }

  return {styles, colors} as const
}
