import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer, Text} from '../../../../components'
import {useBlockGoBack, useWalletNavigation} from '../../../../kernel/navigation'
import {useStrings} from '../../common/useStrings'
import {CameraPermissionDeniedIllustration} from '../../illustrations/CameraPermissionDeniedIlustration'
import {OpenDeviceAppSettingsButton} from './OpenDeviceAppSettingsButton'

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
        <ContinueButton onPress={resetToTxHistory} title={strings.continue} outlineShelley />

        <Spacer height={16} />

        <OpenDeviceAppSettingsButton />
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
      backgroundColor: color.bg_color_high,
      ...atoms.px_lg,
    },
    scroll: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: color.gray_cmax,
      ...atoms.heading_3_medium,
      ...atoms.px_sm,
      textAlign: 'center',
    },
    help: {
      color: color.gray_c600,
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

const ContinueButton = Button
