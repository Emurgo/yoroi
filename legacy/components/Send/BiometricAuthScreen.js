// @flow

import {useFocusEffect} from '@react-navigation/native'
import type {ComponentType} from 'react'
import React, {useEffect, useState} from 'react'
import {type IntlShape, defineMessages, injectIntl} from 'react-intl'
import {Alert, AppState, Platform} from 'react-native'
import {withHandlers, withStateHandlers} from 'recompose'
import {compose} from 'redux'

import {showErrorDialog} from '../../actions'
import KeyStore from '../../crypto/KeyStore'
import {canBiometricEncryptionBeEnabled} from '../../helpers/deviceSettings'
import {errorMessages as globalErrorMessages} from '../../i18n/global-messages'
import type {Navigation} from '../../types/navigation'
import {Logger} from '../../utils/logging'
import {onWillUnmount} from '../../utils/renderUtils'
import FingerprintScreenBase from '../Common/FingerprintScreenBase'
import {Button, Spacer} from '../UiKit'
import styles from './styles/BiometricAuthScreen.style'

const errorMessages = defineMessages({
  NOT_RECOGNIZED: {
    id: 'components.send.biometricauthscreen.NOT_RECOGNIZED',
    defaultMessage: '!!!Biometrics were not recognized. Try again',
  },
  SENSOR_LOCKOUT: {
    id: 'components.send.biometricauthscreen.SENSOR_LOCKOUT',
    defaultMessage: '!!!Too many failed attempts. The sensor is now disabled',
  },
  SENSOR_LOCKOUT_PERMANENT: {
    id: 'components.send.biometricauthscreen.SENSOR_LOCKOUT_PERMANENT',
    defaultMessage: '!!!Your biometrics sensor has been permanently locked. Use an alternate login method.',
  },
  DECRYPTION_FAILED: {
    id: 'components.send.biometricauthscreen.DECRYPTION_FAILED',
    defaultMessage: '!!!Biometrics login failed. Please use an alternate login method.',
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
  useFallbackButton: {
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

const handleOnConfirm = async (route, setError, clearError, useFallback = false, intl) => {
  if (!(await canBiometricEncryptionBeEnabled())) {
    await showErrorDialog(globalErrorMessages.biometricsIsTurnedOff, intl)
    return
  }

  const {keyId, onSuccess, onFail} = route.params

  try {
    const decryptedData = await KeyStore.getData(
      keyId,
      useFallback ? 'SYSTEM_PIN' : 'BIOMETRICS',
      intl.formatMessage(messages.authorizeOperation),
      '',
      intl,
    )
    onSuccess(decryptedData)
  } catch (error) {
    if (error.code === KeyStore.REJECTIONS.SWAPPED_TO_FALLBACK) {
      clearError()
    } else if (error.code === KeyStore.REJECTIONS.CANCELED) {
      clearError()
      onFail(KeyStore.REJECTIONS.CANCELED, intl)
    } else if (error.code === KeyStore.REJECTIONS.INVALID_KEY) {
      onFail(KeyStore.REJECTIONS.INVALID_KEY, intl)
    } else if (error.code === KeyStore.REJECTIONS.SENSOR_LOCKOUT) {
      setError('SENSOR_LOCKOUT')
    } else if (error.code === KeyStore.REJECTIONS.SENSOR_LOCKOUT_PERMANENT) {
      setError('SENSOR_LOCKOUT_PERMANENT')
    } else {
      Alert.alert(intl.formatMessage(messages.actionFailed), error.message)
      Logger.error('BiometricAuthScreen', error)
      setError('UNKNOWN_ERROR')
    }
  }
}

const handleOnFocus = async ({
  route,
  setError,
  clearError,
  intl,
}: {
  route: any,
  setError: any,
  clearError: any,
  intl: IntlShape,
}) => {
  await handleOnConfirm(route, setError, clearError, false, intl)
}

const BiometricAuthScreen = (
  {cancelScanning, useFallback, error, intl, route, setError, clearError}: {intl: IntlShape} & Object /* TODO: type */,
) => {
  const [appState, setAppState] = useState<?string>(AppState.currentState)

  useFocusEffect(
    React.useCallback(() => {
      handleOnFocus({route, setError, clearError, intl})
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
        await handleOnFocus({route, setError, clearError, intl})
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
          title={intl.formatMessage(messages.useFallbackButton)}
          onPress={useFallback}
          containerStyle={styles.useFallback}
        />,
      ]}
      error={error && intl.formatMessage(errorMessages[error])}
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

type ErrorCode =
  | 'NOT_RECOGNIZED'
  | 'SENSOR_LOCKOUT'
  | 'SENSOR_LOCKOUT_PERMANENT'
  | 'DECRYPTION_FAILED'
  | 'UNKNOWN_ERROR'

type State = {
  error: null | ErrorCode,
}

export default injectIntl(
  (compose(
    withStateHandlers(
      ({
        error: null,
      }: State),
      {
        setError: () => (error: ErrorCode) => ({error}),
        clearError: () => () => ({error: null}),
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
      useFallback:
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
