// @flow

import React from 'react'
import {AppState} from 'react-native'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'

import {Logger} from '../../utils/logging'
import {Button} from '../UiKit'
import FingerprintScreenBase from '../Common/FingerprintScreenBase'
import KeyStore from '../../crypto/KeyStore'
import {
  onDidMount,
  onWillUnmount,
  withTranslations,
} from '../../utils/renderUtils'

import styles from './styles/BiometricAuthScreen.style'

import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'

const getTranslations = (state) => state.trans.BiometricsAuthScreen

const handleOnConfirm = async (
  navigation,
  setError,
  clearError,
  useFallback = false,
  translations,
) => {
  const keyId = navigation.getParam('keyId')
  const onSuccess = navigation.getParam('onSuccess')
  const onFail = navigation.getParam('onFail')

  try {
    const decryptedData = await KeyStore.getData(
      keyId,
      useFallback ? 'SYSTEM_PIN' : 'BIOMETRICS',
      translations.authorizeOperation,
      '',
    )
    onSuccess(decryptedData)
    return
  } catch (error) {
    if (error.code === KeyStore.REJECTIONS.SWAPPED_TO_FALLBACK) {
      clearError()
    } else if (error.code === KeyStore.REJECTIONS.CANCELED) {
      clearError()
      onFail(KeyStore.REJECTIONS.CANCELED)
    } else if (error.code === KeyStore.REJECTIONS.INVALID_KEY) {
      onFail(KeyStore.REJECTIONS.INVALID_KEY)
    } else if (error.code === KeyStore.REJECTIONS.SENSOR_LOCKOUT) {
      setError('SENSOR_LOCKOUT')
    } else if (error.code === KeyStore.REJECTIONS.SENSOR_LOCKOUT_PERMANENT) {
      setError('SENSOR_LOCKOUT_PERMANENT')
    } else if (error.code !== KeyStore.REJECTIONS.DECRYPTION_FAILED) {
      handleOnConfirm(navigation, setError, clearError, false, translations)
    } else {
      Logger.error('BiometricAuthScreen', error)
      setError('UNKNOWN_ERROR')
    }
  }
}

const handleAppBackgroundChange = (nextAppState) => {
  if (nextAppState === 'background') {
    KeyStore.cancelFingerprintScanning(KeyStore.REJECTIONS.CANCELED)
  }
}

const BiometricAuthScreen = ({
  cancelScanning,
  useFallback,
  error,
  translations,
}) => (
  <FingerprintScreenBase
    onGoBack={cancelScanning}
    headings={translations.headings}
    buttons={[
      <Button
        key={'use-fallback'}
        outline
        title={translations.useFallbackButton}
        onPress={useFallback}
        containerStyle={styles.useFallback}
      />,
    ]}
    error={error && translations.errors[error]}
  />
)

type ExternalProps = {|
  navigation: Navigation,
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

export default (compose(
  withTranslations(getTranslations),
  withStateHandlers<State, *, *>(
    {
      error: null,
    },
    {
      setError: (state) => (error: ErrorCode) => ({error}),
      clearError: (state) => () => ({error: null}),
    },
  ),
  withHandlers({
    // we have this handler because we need to let JAVA side know user
    // cancelled the scanning by either navigating out of this window
    // or using fallback
    cancelScanning: ({setError, clearError, navigation}) => async () => {
      const wasScanningStarted = await KeyStore.cancelFingerprintScanning(
        KeyStore.REJECTIONS.CANCELED,
      )

      if (!wasScanningStarted) {
        clearError()
        navigation.getParam('onFail')(KeyStore.REJECTIONS.CANCELED)
      }
    },
    useFallback: ({
      navigation,
      setError,
      clearError,
      translations,
    }) => async () => {
      await KeyStore.cancelFingerprintScanning(
        KeyStore.REJECTIONS.SWAPPED_TO_FALLBACK,
      )
      handleOnConfirm(navigation, setError, clearError, true, translations)
    },
  }),

  onWillUnmount(async () => {
    await KeyStore.cancelFingerprintScanning(KeyStore.REJECTIONS.CANCELED)
  }),
  onDidMount(({navigation, setError, clearError, translations}) => {
    AppState.addEventListener('change', handleAppBackgroundChange)
    handleOnConfirm(navigation, setError, clearError, false, translations)
  }),
)(BiometricAuthScreen): ComponentType<ExternalProps>)
