import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  GestureResponderEvent,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import QRCode from 'react-native-qrcode-svg'
import Share from 'react-native-share'
import ViewShot, {captureRef} from 'react-native-view-shot'

import {CaptureShareQRCodeCard} from '../CaptureShareQRCodeCard/CaptureShareQRCodeCard'
import {Spacer} from '../Space/Space'
import {Text} from '../Text/Text'

type ShareQRCodeCardProps = {
  qrContent: string
  shareContent: string
  title: string
  onLongPress: (event: GestureResponderEvent) => void
  testID?: string
  onShare?: () => void
  shareLabel: string
}

export const ShareQRCodeCard = ({
  qrContent,
  shareContent,
  title,
  onLongPress,
  testID,
  onShare,
  shareLabel,
}: ShareQRCodeCardProps) => {
  const {color} = useTheme()
  const screenWidth = useWindowDimensions().width

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
        await Share.open({
          url: uri,
          filename: shareLabel,
          message: shareContent,
        })
      }

      captureAndShare()
    }
  }, [isSharing, shareLabel, shareContent])

  if (isSharing)
    return (
      <ViewShot style={styles.shot} ref={ref}>
        <CaptureShareQRCodeCard content={qrContent} />
      </ViewShot>
    )

  return (
    <TouchableWithoutFeedback onLongPress={onLongPress}>
      <>
        <View style={[styles.card, {width: screenWidth - 32}]}>
          <LinearGradient
            style={[StyleSheet.absoluteFill, {opacity: 1, borderRadius: 16}]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={color.bg_gradient_1}
          />

          <Spacer height={16} />

          <Text
            style={[styles.title, {color: color.gray_max}]}
            testID={`${testID}-title`}
          >
            {title}
          </Text>

          <View style={styles.addressContainer}>
            <View
              style={[styles.qrCode, {backgroundColor: color.white_static}]}
            >
              <QRCode
                value={qrContent}
                size={170}
                backgroundColor={color.white_static}
                color={color.black_static}
              />
            </View>

            <Spacer height={16} />

            <Text style={[styles.textAddress, {color: color.gray_max}]}>
              {qrContent}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.5}
            onPress={handleOnPressShare}
            onLongPress={onLongPress}
          >
            <Text style={[styles.textShareAddress, {color: color.gray_900}]}>
              {shareLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    </TouchableWithoutFeedback>
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
  shot: {
    height: 308,
  },
  card: {
    ...a.gap_lg,
    minHeight: 432,
    ...a.align_center,
    ...a.flex_1,
    ...a.px_lg,
  },
  title: {
    ...a.heading_3_medium,
  },
  textAddress: {
    textAlign: 'center',
    ...a.body_2_md_medium,
  },
  textShareAddress: {
    height: 32,
    textAlignVertical: 'center',
    ...a.button_2_md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
