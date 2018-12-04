// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View} from 'react-native'
import {withHandlers, withState} from 'recompose'

import {Text, Button} from '../UiKit'
import KeyStore from '../../crypto/KeyStore'
import {onDidMount, onWillUnmount} from '../../utils/renderUtils'

const getTranslations = (state) => state.trans.BiometricsAuthScreen

const handleOnConfirm = async (
  navigation,
  setError,
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
      setError('')
      return
    }

    if (error.code === KeyStore.REJECTIONS.CANCELED) {
      setError('')
      onFail(KeyStore.REJECTIONS.CANCELED)
      return
    }

    // biometrics canceled by user, switch to system pin
    if (error.code === KeyStore.REJECTIONS.BIOMETRIC_PROMPT_CANCELED) {
      handleOnConfirm(navigation, setError, true, translations)
      return
    }

    if (
      error.code !== KeyStore.REJECTIONS.DECRYPTION_FAILED &&
      error.code !== KeyStore.REJECTIONS.SENSOR_LOCKOUT &&
      error.code !== KeyStore.REJECTIONS.INVALID_KEY
    ) {
      handleOnConfirm(navigation, setError, false, translations)
    } else if (error.code === KeyStore.REJECTIONS.INVALID_KEY) {
      onFail(KeyStore.REJECTIONS.INVALID_KEY)
      return
    } else {
      setError(error.code || 'UNKNOWN_ERROR')
    }
    return
  }
}

const BiometricAuthScreen = ({
  cancelScanning,
  useFallback,
  error,
  translations,
}) => (
  <View>
    {!error ? <Text>{translations.putFingerOnSensorMessage}</Text> : null}

    {error && error === KeyStore.REJECTIONS.NOT_RECOGNIZED ? (
      <Text>{translations.Errors.notRecognized}</Text>
    ) : null}

    {error && error === KeyStore.REJECTIONS.SENSOR_LOCKOUT ? (
      <Text>{translations.Errors.tooManyTries}</Text>
    ) : null}

    {error && error === KeyStore.REJECTIONS.DECRYPTION_FAILED ? (
      <Text>{translations.Errors.sensorFailed}</Text>
    ) : null}

    <Button title={translations.useFallbackButton} onPress={useFallback} />
    <Button title={translations.cancelButton} onPress={cancelScanning} />
  </View>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withState('error', 'setError', ''),
  withHandlers({
    cancelScanning: () => async () => {
      await KeyStore.cancelFingerprintScanning(KeyStore.REJECTIONS.CANCELED)
    },
    useFallback: ({navigation, setError, translations}) => async () => {
      await KeyStore.cancelFingerprintScanning(
        KeyStore.REJECTIONS.SWAPPED_TO_FALLBACK,
      )
      handleOnConfirm(navigation, setError, true, translations)
    },
  }),
  onWillUnmount(async () => {
    await KeyStore.cancelFingerprintScanning(KeyStore.REJECTIONS.CANCELED)
  }),
  onDidMount(({navigation, setError, translations}) =>
    handleOnConfirm(navigation, setError, false, translations),
  ),
)(BiometricAuthScreen)
