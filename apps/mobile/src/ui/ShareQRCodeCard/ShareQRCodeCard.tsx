import {atoms as a, useTheme} from '@yoroi/theme'
import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {
  GestureResponderEvent,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import Share from 'react-native-share'
import ViewShot, {captureRef} from 'react-native-view-shot'

import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

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
  const ref = React.useRef<ViewShot>(null)

  const handleOnPressShare = async () => {
    onShare?.()

    if (isSharing) return

    setIsSharing(true)

    try {
      const uri = await captureRef(ref, {
        format: 'png',
        quality: 0.8,
      })

      await Share.open({
        url: uri,
        message: shareContent,
      })
    } catch (error) {
      // User cancelled or error occurred
      console.log('Share cancelled or error:', error)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <TouchableWithoutFeedback onLongPress={onLongPress}>
      <ViewShot
        ref={ref}
        style={[
          a.gap_lg,
          a.align_center,
          a.flex_1,
          a.px_lg,
          a.rounded_lg,
          {
            minHeight: 432,
            width: screenWidth - 32,
          },
          a.overflow_hidden,
        ]}
      >
        <LinearGradient
          style={[
            {
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 1,
            },
            a.absolute,
            a.inset_0,
            a.rounded_lg,
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

        <View style={a.align_center}>
          <View
            style={[a.p_md, a.rounded_lg, {backgroundColor: p.white_static}]}
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
            style={[a.text_center, a.body_2_md_medium, {color: p.gray_max}]}
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
              a.button_2_md,
              {
                height: 32,
                textAlignVertical: 'center',
                color: p.gray_900,
              },
            ]}
          >
            {shareLabel}
          </Text>
        </TouchableOpacity>
      </ViewShot>
    </TouchableWithoutFeedback>
  )
}
