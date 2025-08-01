import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView, View, ViewProps} from 'react-native'
import {openSettings} from 'react-native-permissions'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useBlockGoBack, useWalletNavigation} from '~/kernel/navigation'
import {Button} from '~/ui/Button/Button'
import {CameraPermissionDeniedIllustration} from '~/ui/CameraPermissionDeniedIllustration/CameraPermissionDeniedIllustration'
import {Space} from '~/ui/Space/Space'
import {Text as YoroiText} from '~/ui/Text/Text'

export const ShowCameraPermissionDeniedScreen = () => {
  const strings = useStrings()
  useBlockGoBack()
  const {resetToTxHistory} = useWalletNavigation()
  const {palette: p} = useTheme()

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[{flex: 1}, a.px_lg, {backgroundColor: p.bg_color_max}]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {flex: 1, alignItems: 'center', justifyContent: 'center'},
        ]}
        bounces={false}
      >
        <CameraPermissionDeniedIllustration />

        <YoroiText
          style={[
            a.heading_3_medium,
            a.px_sm,
            {textAlign: 'center', color: p.gray_max},
          ]}
        >
          {strings.scan.cameraPermissionDeniedTitle}
        </YoroiText>

        <YoroiText
          style={[
            a.body_2_md_regular,
            {textAlign: 'center', maxWidth: 330, color: p.gray_600},
          ]}
        >
          {strings.scan.cameraPermissionDeniedHelp}
        </YoroiText>
      </ScrollView>

      <Actions style={[styles.actions, a.py_lg]}>
        <Button
          onPress={resetToTxHistory}
          title={strings.scan.continue}
          size="S"
          type={ButtonType.Secondary}
        />

        <Space.Height.md />

        <Button
          onPress={() => openSettings()}
          title={strings.scan.openAppSettings}
          size="S"
        />
      </Actions>
    </SafeAreaView>
  )
}

const Actions = ({style, ...props}: ViewProps) => {
  return <View style={style} {...props} />
}
