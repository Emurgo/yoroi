import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  GestureResponderEvent,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import QRCode from 'react-native-qrcode-svg'
import Share from 'react-native-share'
import ViewShot, {captureRef} from 'react-native-view-shot'

import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {CaptureShareQRCodeCard} from '../CaptureShareQRCodeCard/CaptureShareQRCodeCard'

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
  const {palette: p} = useTheme()
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
      <ViewShot style={{height: 308}} ref={ref}>
        <CaptureShareQRCodeCard content={qrContent} />
      </ViewShot>
    )

  return (
    <TouchableWithoutFeedback onLongPress={onLongPress}>
      <>
        <View
          style={[
            a.gap_lg,
            a.align_center,
            a.flex_1,
            a.px_lg,
            {
              minHeight: 432,
              borderRadius: 16,
              alignItems: 'center',
              width: screenWidth - 32,
              overflow: 'hidden',
            },
          ]}
        >
          <LinearGradient
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 1,
                borderRadius: 16,
              },
            ]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            colors={p.bg_gradient_1}
          />

          <Space.Height.md />

          <Text
            style={[a.heading_3_medium, {color: p.gray_max}]}
            testID={`${testID}-title`}
          >
            {title}
          </Text>

          <View style={{alignItems: 'center'}}>
            <View
              style={{
                padding: 10,
                borderRadius: 8,
                backgroundColor: p.white_static,
              }}
            >
              <QRCode
                value={qrContent}
                size={170}
                backgroundColor={p.white_static}
                color={p.black_static}
              />
            </View>

            <Space.Height.md />

            <Text
              style={[
                {textAlign: 'center'},
                a.body_2_md_medium,
                {color: p.gray_max},
              ]}
            >
              {qrContent}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.5}
            onPress={handleOnPressShare}
            onLongPress={onLongPress}
          >
            <Text
              style={[
                {
                  height: 32,
                  textAlignVertical: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                },
                a.button_2_md,
                {color: p.gray_900},
              ]}
            >
              {shareLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    </TouchableWithoutFeedback>
  )
}
