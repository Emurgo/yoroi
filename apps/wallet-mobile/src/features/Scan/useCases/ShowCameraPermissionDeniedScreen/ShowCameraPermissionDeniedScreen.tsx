import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import {openSettings} from 'react-native-permissions'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, ButtonType} from '../../../../components/Button/Button'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {Text} from '../../../../components/Text'
import {useBlockGoBack, useWalletNavigation} from '../../../../kernel/navigation'
import {useStrings} from '../../common/useStrings'
import {CameraPermissionDeniedIllustration} from '../../illustrations/CameraPermissionDeniedIlustration'

export const ShowCameraPermissionDeniedScreen = () => {
  const styles = useStyles()

  const strings = useStrings()
  useBlockGoBack()
  const {resetToTxHistory} = useWalletNavigation()

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        <CameraPermissionDeniedIllustration />

        <Text style={styles.title}>{strings.cameraPermissionDeniedTitle}</Text>

        <Text style={styles.help}>{strings.cameraPermissionDeniedHelp}</Text>
      </ScrollView>

      <Actions>
        <Button onPress={resetToTxHistory} title={strings.continue} size="S" type={ButtonType.Secondary} />

        <Spacer height={16} />

        <Button onPress={openSettings} title={strings.openAppSettings} size="S" />
      </Actions>
    </SafeAreaView>
  )
}

const Actions = ({style, ...props}: ViewProps) => {
  const styles = useStyles()
  return <View style={[styles.actions, style]} {...props} />
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.bg_color_max,
      ...atoms.px_lg,
    },
    scroll: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: color.gray_max,
      ...atoms.heading_3_medium,
      ...atoms.px_sm,
      textAlign: 'center',
    },
    help: {
      color: color.gray_600,
      ...atoms.body_2_md_regular,
      textAlign: 'center',
      maxWidth: 330,
    },
    actions: {
      ...atoms.py_lg,
    },
  })
  return styles
}
