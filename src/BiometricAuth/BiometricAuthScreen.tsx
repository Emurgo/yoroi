/* eslint-disable @typescript-eslint/no-explicit-any */
import {useFocusEffect, useRoute} from '@react-navigation/native'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, AppState, Platform, StyleSheet} from 'react-native'

import {Button, Spacer} from '../components'
import {errorMessages as globalErrorMessages} from '../i18n/global-messages'
import {showErrorDialog} from '../legacy/actions'
import {canBiometricEncryptionBeEnabled, recreateAppSignInKeys} from '../legacy/deviceSettings'
import KeyStore, {CredentialsNotFound} from '../legacy/KeyStore'
import {Logger} from '../legacy/logging'
import {FingerprintScreenBase} from './FingerprintScreenBase'

export const BiometricAuthScreen = () => {
  const intl = useIntl()
  const route: any = useRoute()
  const strings = useStrings()
  const [appState, setAppState] = useState<string>(AppState.currentState)

  const fallback = async () => {
    await KeyStore.cancelFingerprintScanning(KeyStore.REJECTIONS.SWAPPED_TO_FALLBACK)
    await handleOnConfirm(route, setError, clearError, true, intl)
  }

  const cancelScanning = async () => {
    const wasScanningStarted = await KeyStore.cancelFingerprintScanning(KeyStore.REJECTIONS.CANCELED)

    if (!wasScanningStarted) {
      clearError()
      const {onFail} = route.params
      if (onFail == null) throw new Error('BiometricAuthScreen::onFail')
      onFail(KeyStore.REJECTIONS.CANCELED, intl)
    }
  }

  const [error, setError] = React.useState('')
  const clearError = () => setError('')

  React.useEffect(() => () => void KeyStore.cancelFingerprintScanning(KeyStore.REJECTIONS.CANCELED), [])

  useFocusEffect(
    React.useCallback(() => {
      handleOnConfirm(route, setError, clearError, false, intl)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  )

  useEffect(() => {
    const handleAppStateChange: (appState: string) => Promise<void> = async (nextAppState) => {
      if (Platform.OS !== 'android') return

      const previousAppState = appState
      setAppState(nextAppState)
      if (previousAppState != null && previousAppState.match(/inactive|background/) && nextAppState === 'active') {
        await KeyStore.cancelFingerprintScanning(KeyStore.REJECTIONS.CANCELED)
        await handleOnConfirm(route, setError, clearError, false, intl)
      } else if (previousAppState === 'active' && nextAppState != null && nextAppState.match(/inactive|background/)) {
        // we cancel the operation when the app goes to background otherwise
        // the app may crash. This could happen when the app logs out, as reopening
        // the app triggers a new biometric prompt; but may also be an issue for
        // some specific Android versions
        await KeyStore.cancelFingerprintScanning(KeyStore.REJECTIONS.CANCELED)
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return () => subscription?.remove()
  }, [appState, intl, route])

  return (
    <FingerprintScreenBase
      onGoBack={cancelScanning}
      headings={[strings.headings1, strings.headings2]}
      subHeadings={route.params?.instructions || undefined}
      buttons={[
        <Button
          key="try-again"
          outline
          title={strings.tryAgainButton}
          onPress={() => handleOnConfirm(route, setError, clearError, false, intl)}
        />,
        <Spacer key="spacer" width={4} />,
        <Button
          key="use-fallback"
          outline
          title={strings.fallbackButton}
          onPress={fallback}
          containerStyle={styles.fallbackButton}
        />,
      ]}
      error={error}
      addWelcomeMessage={route.params?.addWelcomeMessage === true}
    />
  )
}

const styles = StyleSheet.create({
  fallbackButton: {flex: 1},
})

const useStrings = () => {
  const intl = useIntl()

  return {
    headings1: intl.formatMessage(messages.headings1),
    headings2: intl.formatMessage(messages.headings2),
    tryAgainButton: intl.formatMessage(messages.tryAgainButton),
    fallbackButton: intl.formatMessage(messages.fallbackButton),
  }
}

const errorMessages = defineMessages({
  [KeyStore.REJECTIONS.NOT_RECOGNIZED]: {
    id: 'components.send.biometricauthscreen.NOT_RECOGNIZED',
    defaultMessage: '!!!Biometrics were not recognized. Try again',
  },
  [KeyStore.REJECTIONS.DECRYPTION_FAILED]: {
    id: 'components.send.biometricauthscreen.DECRYPTION_FAILED',
    defaultMessage: '!!!Biometrics login failed. Please use an alternate login method.',
  },
  [KeyStore.REJECTIONS.SENSOR_LOCKOUT]: {
    id: 'components.send.biometricauthscreen.SENSOR_LOCKOUT',
    defaultMessage: '!!!Too many failed attempts. The sensor is now disabled',
  },
  [KeyStore.REJECTIONS.SENSOR_LOCKOUT_PERMANENT]: {
    id: 'components.send.biometricauthscreen.SENSOR_LOCKOUT_PERMANENT',
    defaultMessage: '!!!Your biometrics sensor has been permanently locked. Use an alternate login method.',
  },
  UNKNOWN_ERROR: {
    id: 'components.send.biometricauthscreen.UNKNOWN_ERROR',
    defaultMessage: '!!!Unknown error',
  },
})

const messages = defineMessages({
  authorizeOperation: {
    id: 'components.send.biometricauthscreen.authorizeOperation',
    defaultMessage: '!!!Authorize operation',
  },
  fallbackButton: {
    id: 'components.send.biometricauthscreen.useFallbackButton',
    defaultMessage: '!!!Use fallback',
  },
  headings1: {
    id: 'components.send.biometricauthscreen.headings1',
    defaultMessage: '!!!Authorize with your',
  },
  headings2: {
    id: 'components.send.biometricauthscreen.headings2',
    defaultMessage: '!!!biometrics',
  },
  tryAgainButton: {
    id: 'global.tryAgain',
    defaultMessage: '!!!Try again',
  },
  actionFailed: {
    id: 'global.actions.dialogs.enableFingerprintsFirst.title',
    defaultMessage: '!!!Action failed',
  },
})

const handleOnConfirm = async (route, setError, clearError, isFallback = false, intl, retryCounter = 0) => {
  if (!(await canBiometricEncryptionBeEnabled()) && !isFallback) {
    await showErrorDialog(globalErrorMessages.biometricsIsTurnedOff, intl)
    return
  }

  const {keyId, onSuccess, onFail} = route.params

  try {
    const decryptedData = isFallback
      ? await KeyStore.getData(keyId, 'SYSTEM_PIN', intl.formatMessage(messages.authorizeOperation), null, intl)
      : await KeyStore.getData(keyId, 'BIOMETRICS', intl.formatMessage(messages.authorizeOperation), null, intl)
    onSuccess(decryptedData)
  } catch (error) {
    if ((error as any).code === KeyStore.REJECTIONS.SWAPPED_TO_FALLBACK && Platform.OS === 'android') {
      clearError()
    } else if ((error as any).code === KeyStore.REJECTIONS.INVALID_KEY && Platform.OS === 'android') {
      onFail(KeyStore.REJECTIONS.INVALID_KEY, intl)
    } else if ((error as any).code === KeyStore.REJECTIONS.CANCELED) {
      clearError()
      onFail(KeyStore.REJECTIONS.CANCELED, intl)
    } else {
      // create keys back for iOS
      if (error instanceof CredentialsNotFound && Platform.OS === 'ios') {
        await recreateAppSignInKeys(keyId)
      }
      if (retryCounter <= 3) {
        await handleOnConfirm(route, setError, clearError, isFallback, intl, retryCounter + 1)
        return
      }
      // on ios most errors will map to FAILED_UNKNOWN_ERROR
      Alert.alert(intl.formatMessage(messages.actionFailed), `${(error as any).code} : ${(error as any).message}`)
      Logger.error('BiometricAuthScreen', error)
      const errorMessageKey =
        (error as any).code && errorMessages[(error as any).code] ? (error as any).code : 'UNKNOWN_ERROR'
      setError(intl.formatMessage(errorMessages[errorMessageKey]))
    }
  }
}
