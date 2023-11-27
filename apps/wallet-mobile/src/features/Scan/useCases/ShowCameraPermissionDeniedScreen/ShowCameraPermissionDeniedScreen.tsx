import React from 'react'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer, Text} from '../../../../components'
import {useBlockGoBack, useWalletNavigation} from '../../../../navigation'
import {COLORS} from '../../../../theme'
import {useStrings} from '../../common/useStrings'
import {CameraPermissionDeniedIllustration} from '../../illustrations/CameraPermissionDeniedIlustration'
import {OpenDeviceAppSettingsButton} from './OpenDeviceAppSettingsButton'

export const ShowCameraPermissionDeniedScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
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

const Actions = ({style, ...props}: ViewProps) => <View style={[styles.actions, style]} {...props} />

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
  },
  scroll: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: COLORS.BLACK,
    fontWeight: 'bold',
    fontSize: 20,
    padding: 4,
    textAlign: 'center',
    lineHeight: 30,
  },
  help: {
    color: COLORS.TEXT_INPUT,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 330,
  },
  actions: {
    paddingVertical: 16,
  },
})

const ContinueButton = Button
