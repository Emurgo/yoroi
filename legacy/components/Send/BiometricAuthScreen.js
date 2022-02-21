// @flow

import {useFocusEffect} from '@react-navigation/native'
import type {ComponentType} from 'react'
import React, {useEffect, useState} from 'react'
import {type IntlShape, defineMessages, injectIntl} from 'react-intl'
import {Alert, AppState, Platform} from 'react-native'
import {withHandlers, withStateHandlers} from 'recompose'
import {compose} from 'redux'

// $FlowExpectedError
import {Spacer} from '../../../src/components'
import {showErrorDialog} from '../../actions'
import KeyStore, {CredentialsNotFound} from '../../crypto/KeyStore'
import {canBiometricEncryptionBeEnabled, recreateAppSignInKeys} from '../../helpers/deviceSettings'
import {errorMessages as globalErrorMessages} from '../../i18n/global-messages'
import type {Navigation} from '../../types/navigation'
import {Logger} from '../../utils/logging'
import {onWillUnmount} from '../../utils/renderUtils'
import FingerprintScreenBase from '../Common/FingerprintScreenBase'
import {Button} from '../UiKit'
import styles from './styles/BiometricAuthScreen.style'

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
  cancelButton: {
    id: 'components.send.biometricauthscreen.cancelButton',
    defaultMessage: '!!!Cancel',
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
    const decryptedData = await KeyStore.getData(
      keyId,
      isFallback ? 'SYSTEM_PIN' : 'BIOMETRICS',
      intl.formatMessage(messages.authorizeOperation),
      '',
      intl,
    )
    onSuccess(decryptedData)
  } catch (error) {
    if (error.code === KeyStore.REJECTIONS.SWAPPED_TO_FALLBACK && Platform.OS === 'android') {
      clearError()
    } else if (error.code === KeyStore.REJECTIONS.INVALID_KEY && Platform.OS === 'android') {
      onFail(KeyStore.REJECTIONS.INVALID_KEY, intl)
    } else if (error.code === KeyStore.REJECTIONS.CANCELED) {
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
      Alert.alert(intl.formatMessage(messages.actionFailed), `${error.code} : ${error.message}`)
      Logger.error('BiometricAuthScreen', error)
      const errorMessageKey = error.code && errorMessages[error.code] ? error.code : 'UNKNOWN_ERROR'
      setError(intl.formatMessage(errorMessages[errorMessageKey]))
    }
  }
}

const BiometricAuthScreen = (
  {cancelScanning, fallback, error, intl, route, setError, clearError}: {intl: IntlShape} & Object /* TODO: type */,
) => {
  const [appState, setAppState] = useState<?string>(AppState.currentState)

  useFocusEffect(
    React.useCallback(() => {
      handleOnConfirm(route, setError, clearError, false, intl)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  )

  useEffect(() => {
    const handleAppStateChange: (?string) => Promise<void> = async (nextAppState) => {
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

    AppState.addEventListener('change', handleAppStateChange)

    return () => AppState.removeEventListener('change', handleAppStateChange)
  }, [appState, route, setError, clearError, intl])

  return (
    <FingerprintScreenBase
      onGoBack={cancelScanning}
      headings={[intl.formatMessage(messages.headings1), intl.formatMessage(messages.headings2)]}
      subHeadings={route.params?.instructions || undefined}
      buttons={[
        <Button
          key={'try-again'}
          outline
          title={intl.formatMessage(messages.tryAgainButton)}
          onPress={() => handleOnConfirm(route, setError, clearError, false, intl)}
        />,
        <Spacer key={'spacer'} width={4} />,
        <Button
          key={'use-fallback'}
          outline
          title={intl.formatMessage(messages.fallbackButton)}
          onPress={fallback}
          containerStyle={styles.fallbackButton}
        />,
      ]}
      error={error}
      addWelcomeMessage={route.params?.addWelcomeMessage === true}
      intl={intl}
    />
  )
}

type ExternalProps = {|
  navigation: Navigation,
  route: any, // TODO: type
  intl: IntlShape,
|}

type State = {
  error: string,
}

export default injectIntl(
  (compose(
    withStateHandlers(
      ({
        error: '',
      }: State),
      {
        setError: () => (error) => ({error}),
        clearError: () => () => ({error: ''}),
      },
    ),
    withHandlers({
      // we have this handler because we need to let JAVA side know user
      // cancelled the scanning by either navigating out of this window
      // or using fallback
      cancelScanning:
        ({clearError, route, intl}: {intl: IntlShape, route: any, clearError: any}) =>
        async () => {
          const wasScanningStarted = await KeyStore.cancelFingerprintScanning(KeyStore.REJECTIONS.CANCELED)

          if (!wasScanningStarted) {
            clearError()
            const {onFail} = route.params
            if (onFail == null) throw new Error('BiometricAuthScreen::onFail')
            onFail(KeyStore.REJECTIONS.CANCELED, intl)
          }
        },
      fallback:
        ({route, setError, clearError, intl}: {route: any, setError: any, clearError: any, intl: IntlShape}) =>
        async () => {
          await KeyStore.cancelFingerprintScanning(KeyStore.REJECTIONS.SWAPPED_TO_FALLBACK)
          await handleOnConfirm(route, setError, clearError, true, intl)
        },
    }),
    onWillUnmount(async () => {
      await KeyStore.cancelFingerprintScanning(KeyStore.REJECTIONS.CANCELED)
    }),
  )(BiometricAuthScreen): ComponentType<ExternalProps>),
)
