import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView, View, ViewProps} from 'react-native'
import {openSettings} from 'react-native-permissions'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useBlockGoBack, useWalletNavigation} from '~/kernel/navigation'
import {Button} from '~/ui/Button/Button'
import {CameraPermissionDeniedIllustration} from '~/ui/CameraPermissionDeniedIllustration/CameraPermissionDeniedIllustration'
import {Space} from '~/ui/Space/Space'
import {Text as YoroiText} from '~/ui/Text/Text'
import {useStrings} from '../../common/useStrings'

export const ShowCameraPermissionDeniedScreen = () => {
  const strings = useStrings()
  useBlockGoBack()
  const {resetToTxHistory} = useWalletNavigation()
  const {color} = useTheme()

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[{flex: 1}, a.px_lg, {backgroundColor: color.bg_color_max}]}
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
            {textAlign: 'center', color: color.gray_max},
          ]}
        >
          {strings.cameraPermissionDeniedTitle}
        </YoroiText>

        <YoroiText
          style={[
            a.body_2_md_regular,
            {textAlign: 'center', maxWidth: 330, color: color.gray_600},
          ]}
        >
          {strings.cameraPermissionDeniedHelp}
        </YoroiText>
      </ScrollView>

      <Actions style={[styles.actions, a.py_lg]}>
        <Button
          onPress={resetToTxHistory}
          title={strings.continue}
          size="S"
          type={ButtonType.Secondary}
        />

        <Space.Height.md />

        <Button
          onPress={() => openSettings()}
          title={strings.openAppSettings}
          size="S"
        />
      </Actions>
    </SafeAreaView>
  )
}

const Actions = ({style, ...props}: ViewProps) => {
  return <View style={style} {...props} />
}
