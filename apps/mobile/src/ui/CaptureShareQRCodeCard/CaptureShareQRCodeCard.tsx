import {atoms as a, useTheme} from '@yoroi/theme'
import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {useWindowDimensions, View} from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {YoroiLogoIllustration} from '../YoroiLogoIllustration/YoroiLogoIllustration'

type ShareProps = {
  content: string
}

export const CaptureShareQRCodeCard = ({content}: ShareProps) => {
  const {palette: p} = useTheme()
  const screenWidth = useWindowDimensions().width

  return (
    <View
      style={[
        {
          borderRadius: 10,
          alignItems: 'center',
          maxHeight: 308,
          flex: 1,
          minHeight: 308,
          alignSelf: 'center',
          overflow: 'hidden',
          paddingVertical: 16,
          gap: 32,
          width: screenWidth - 34,
        },
      ]}
    >
      <LinearGradient
        style={[
          {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            opacity: 1,
          },
        ]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        colors={p.bg_gradient_1}
      />

      <Space.Height.lg />

      <View style={[a.justify_center, a.align_center]}>
        <YoroiLogoIllustration height={37} width={35} />

        <Space.Height.lg />

        <View style={[{alignItems: 'center'}]}>
          <View
            style={[
              {padding: 10, borderRadius: 8, backgroundColor: p.white_static},
            ]}
          >
            <QRCode
              value={content}
              size={170}
              backgroundColor={p.white_static}
              color={p.black_static}
            />
          </View>

          <Space.Height.lg />

          <Text
            style={[
              {textAlign: 'center', maxWidth: 300},
              a.body_1_lg_regular,
              {color: 'transparent'},
            ]}
          >
            {content}
          </Text>
        </View>
      </View>
    </View>
  )
}
