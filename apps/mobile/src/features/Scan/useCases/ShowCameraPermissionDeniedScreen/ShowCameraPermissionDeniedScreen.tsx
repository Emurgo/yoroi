import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, ScrollView, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useBlockGoBack, useWalletNavigation} from '~/kernel/navigation/hooks'
import {Button, ButtonType} from '~/ui/Button/Button'
import {CameraPermissionDeniedIllustration} from '~/ui/CameraPermissionDeniedIllustration/CameraPermissionDeniedIllustration'
import {Space} from '~/ui/Space/Space'
import {Text as YoroiText} from '~/ui/Text/Text'

export const ShowCameraPermissionDeniedScreen = () => {
  const strings = useStrings()
  useBlockGoBack()
  const {resetToTxHistory} = useWalletNavigation()
  const {atoms: ta} = useTheme()

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[{flex: 1}, a.px_lg, ta.bg_color_max]}
    >
      <ScrollView
        contentContainerStyle={[
          {flex: 1, alignItems: 'center', justifyContent: 'center'},
        ]}
        bounces={false}
      >
        <CameraPermissionDeniedIllustration />

        <YoroiText
          style={[a.heading_3_medium, a.px_sm, a.text_center, ta.text_gray_max]}
        >
          {strings.scan.cameraPermissionDeniedTitle}
        </YoroiText>

        <YoroiText
          style={[
            a.body_2_md_regular,
            a.text_center,
            {maxWidth: 330},
            ta.text_gray_medium,
          ]}
        >
          {strings.scan.cameraPermissionDeniedHelp}
        </YoroiText>
      </ScrollView>

      <View style={[a.py_lg]}>
        <Button
          onPress={resetToTxHistory}
          title={strings.scan.continue}
          size="S"
          type={ButtonType.Secondary}
        />

        <Space.Height.md />

        <Button
          onPress={() => Linking.openSettings()}
          title={strings.scan.openAppSettings}
          size="S"
        />
      </View>
    </SafeAreaView>
  )
}
