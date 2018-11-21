// @flow
/* eslint-disable-next-line */ // $FlowFixMe
import {KeyStoreBridge} from 'NativeModules'
import React from 'react'
import {compose} from 'redux'
import {View} from 'react-native'
import {withHandlers, withState} from 'recompose'

import {Text, Button} from '../UiKit'
import KeyStore from '../../crypto/KeyStore'
import {onDidMount} from '../../utils/renderUtils'
// import styles from './styles/BiometricAuthScreen.style'

const handleOnConfirm = async (navigation, setError, useFallback = false) => {
  const encryptedDataId = navigation.getParam('encryptedDataId')
  const onSuccess = navigation.getParam('onSuccess')
  const onFail = navigation.getParam('onFail')

  let decryptedData = ''
  try {
    decryptedData = await KeyStore.getData(
      encryptedDataId,
      useFallback ? 'SYSTEM_PIN' : 'BIOMETRICS',
      'l10n Authorize operation',
      '',
    )
    onSuccess(decryptedData)
    return
  } catch (error) {
    if (error.code === 'CANCELED') {
      setError('')
      onFail('CANCELED')
      return
    }

    // biometrics canceled by user, switch to system pin
    if (error.code === 'BIOMETRIC_PROMPT_CANCELED') {
      handleOnConfirm(navigation, setError, true)
      return
    }

    if (
      error.code !== 'DECRYPTION_FAILED' &&
      error.code !== 'SENSOR_LOCKOUT' &&
      error.code !== 'INVALID_KEY'
    ) {
      handleOnConfirm(navigation, setError, false)
    } else if (error.code === 'INVALID_KEY') {
      onFail('INVALID_KEY')
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

    {error && error === 'NOT_RECOGNIZED' ? (
      <Text>l10n Fingerprint was not recognized try again</Text>
    ) : null}

    {error && error === 'SENSOR_LOCKOUT' ? (
      <Text>l10n You used too many fingers sensor is disabled</Text>
    ) : null}

    {error && error === 'DECRYPTION_FAILED' ? (
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
      await KeyStoreBridge.cancelFingerprintScanning('CANCELED')
      navigation.getParam('onFail')()
    },
    useFallback: ({navigation, setError}) => async () => {
      await KeyStoreBridge.cancelFingerprintScanning('CANCELED')
      handleOnConfirm(navigation, setError, true)
    },
  }),
  onDidMount(({navigation, setError}) => handleOnConfirm(navigation, setError)),
)(BiometricAuthScreen)
