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
// import ViewShot, {captureRef} from 'react-native-view-shot'

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
  const ref = React.useRef<any>(null)

  const handleOnPressShare = () => {
    onShare?.()
    // Temporarily disabled view-shot functionality due to native module issues
    // Share.open({
    //   message: shareContent,
    // })
  }

  return (
    <TouchableWithoutFeedback onLongPress={onLongPress}>
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

        <View style={a.align_center}>
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
    </TouchableWithoutFeedback>
  )
}
