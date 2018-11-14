// @flow
/* eslint-disable-next-line */ // $FlowFixMe
import {KeyStoreBridge} from 'NativeModules'
import React from 'react'
import {compose} from 'redux'
import {View} from 'react-native'
import {withHandlers, withState} from 'recompose'

import {Text, Button} from '../UiKit'
import walletManager from '../../crypto/wallet'
import {SEND_ROUTES} from '../../RoutesList'
import {onDidMount} from '../../utils/renderUtils'

// import styles from './styles/FingerprintSignScreen.style'

const handleOnConfirm = async (navigation, setError, useFallback = false) => {
  const transactionData = navigation.getParam('transactionData')

  let signedTx = ''
  try {
    signedTx = await walletManager.signTx(
      transactionData,
      useFallback ? 'SYSTEM_PIN' : 'BIOMETRY',
      '',
    )
  } catch (error) {
    // system pin cancelation
    if (error.code === 'CANCELED') {
      setError('')
      if (useFallback) {
        navigation.goBack()
      }
      return
    }

    if (error.code !== 'DECRYPTION_FAILED' && error.code !== 'SENSOR_LOCKOUT') {
      handleOnConfirm(navigation, setError, false)
    } else {
      setError(error.code || 'UNKNOWN_ERROR')
    }
    return
  }

  navigation.navigate(SEND_ROUTES.SENDING_MODAL, {signedTx})
}

const FingerprintSignScreen = ({cancelScanning, useFallback, error}) => (
  <View>
    {!error ? <Text>l10n Put you finger on sensor to sign tx</Text> : null}

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
      navigation.goBack()
    },
    useFallback: ({navigation, setError}) => async () => {
      await KeyStoreBridge.cancelFingerprintScanning('CANCELED')
      handleOnConfirm(navigation, setError, true)
    },
  }),
  onDidMount(({navigation, setError}) => handleOnConfirm(navigation, setError)),
)(FingerprintSignScreen)
