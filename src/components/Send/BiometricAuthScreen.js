// @flow
/* eslint-disable-next-line */ // $FlowFixMe
import {KeyStoreBridge} from 'NativeModules'
import React from 'react'
import {compose} from 'redux'
import {View} from 'react-native'
import {withHandlers, withState} from 'recompose'

import {Text, Button} from '../UiKit'
import KeyStore from '../../crypto/KeyStore'
import {onDidMount, onWillUnmount} from '../../utils/renderUtils'
// import styles from './styles/BiometricAuthScreen.style'

const handleOnConfirm = async (navigation, setError, useFallback = false) => {
  const keyId = navigation.getParam('keyId')
  const onSuccess = navigation.getParam('onSuccess')
  const onFail = navigation.getParam('onFail')

  try {
    const decryptedData = await KeyStore.getData(
      keyId,
      useFallback ? 'SYSTEM_PIN' : 'BIOMETRICS',
      'l10n Authorize operation',
      '',
    )
    onSuccess(decryptedData)
    return
  } catch (error) {
    if (error.code === KeyStore.REJECTIONS.CANCELED) {
      setError('')
      onFail(KeyStore.REJECTIONS.CANCELED)
      return
    }

    // biometrics canceled by user, switch to system pin
    if (error.code === KeyStore.REJECTIONS.BIOMETRIC_PROMPT_CANCELED) {
      handleOnConfirm(navigation, setError, true)
      return
    }

    if (
      error.code !== KeyStore.REJECTIONS.DECRYPTION_FAILED &&
      error.code !== KeyStore.REJECTIONS.SENSOR_LOCKOUT &&
      error.code !== KeyStore.REJECTIONS.INVALID_KEY
    ) {
      handleOnConfirm(navigation, setError, false)
    } else if (error.code === KeyStore.REJECTIONS.INVALID_KEY) {
      onFail(KeyStore.REJECTIONS.INVALID_KEY)
      return
    } else {
      setError(error.code || 'UNKNOWN_ERROR')
    }
    return
  }
}

const BiometricAuthScreen = ({cancelScanning, useFallback, error}) => (
  <View>
    {!error ? (
      <Text>l10n Put you finger on sensor to auth operation</Text>
    ) : null}

    {error && error === KeyStore.REJECTIONS.NOT_RECOGNIZED ? (
      <Text>l10n Fingerprint was not recognized try again</Text>
    ) : null}

    {error && error === KeyStore.REJECTIONS.SENSOR_LOCKOUT ? (
      <Text>l10n You used too many fingers sensor is disabled</Text>
    ) : null}

    {error && error === KeyStore.REJECTIONS.DECRYPTION_FAILED ? (
      <Text>l10n Fingerprint sensor failed please use fallback</Text>
    ) : null}

    <Button title="l10 Use fallback" onPress={useFallback} />
    <Button title="l10 Cancel" onPress={cancelScanning} />
  </View>
)

export default compose(
  withState('error', 'setError', ''),
  withHandlers({
    cancelScanning: ({navigation}) => async () => {
      await KeyStoreBridge.cancelFingerprintScanning(
        KeyStore.REJECTIONS.CANCELED,
      )
      navigation.getParam('onFail')()
    },
    useFallback: ({navigation, setError}) => async () => {
      await KeyStoreBridge.cancelFingerprintScanning(
        KeyStore.REJECTIONS.CANCELED,
      )
      handleOnConfirm(navigation, setError, true)
    },
  }),
  onWillUnmount(async () => {
    await KeyStoreBridge.cancelFingerprintScanning(KeyStore.REJECTIONS.CANCELED)
  }),
  onDidMount(({navigation, setError}) => handleOnConfirm(navigation, setError)),
)(BiometricAuthScreen)
