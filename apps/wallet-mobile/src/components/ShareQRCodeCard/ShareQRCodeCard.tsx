import {useTheme} from '@yoroi/theme'
import _ from 'lodash'
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

import {Spacer} from '../Spacer/Spacer'
import {Text} from '../Text'
import {CaptureShareQRCodeCard} from './CaptureShareQRCodeCard/CaptureShareQRCodeCard'

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
        await Share.open({url: uri, filename: shareLabel, message: shareContent})
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
        <View style={styles.card}>
          <LinearGradient
            style={[StyleSheet.absoluteFill, {opacity: 1, borderRadius: 16}]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={colors.bgCard}
          />

          <Spacer height={16} />

          <Text style={styles.title} testID={`${testID}-title`}>
            {title}
          </Text>

          <View style={styles.addressContainer}>
            <View style={styles.qrCode} testID={`${testID}-qr`}>
              <QRCode value={qrContent} size={qrSize} backgroundColor={colors.white} color={colors.black} />
            </View>

            <Spacer height={16} />

            <Text style={styles.textAddress}>{qrContent}</Text>
          </View>

          <TouchableOpacity activeOpacity={0.5} onPress={handleOnPressShare} onLongPress={onLongPress}>
            <Text style={styles.textShareAddress}>{shareLabel}</Text>
          </TouchableOpacity>
        </View>
      </>
    </TouchableWithoutFeedback>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const screenWidth = useWindowDimensions().width

  const qrSize = 170

  const styles = StyleSheet.create({
    qrCode: {
      backgroundColor: color.white_static,
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
      ...atoms.gap_lg,
      minHeight: 432,
      width: screenWidth - 32,
      ...atoms.align_center,
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
    title: {
      ...atoms.heading_3_medium,
      color: color.gray_max,
    },
    textAddress: {
      textAlign: 'center',
      ...atoms.body_2_md_medium,
      color: color.gray_max,
    },
    textShareAddress: {
      height: 32,
      textAlignVertical: 'center',
      color: color.gray_900,
      ...atoms.button_2_md,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  })

  const colors = {
    bgCard: color.bg_gradient_1,
    white: color.white_static,
    black: color.black_static,
  }

  return {styles, colors, qrSize} as const
}
