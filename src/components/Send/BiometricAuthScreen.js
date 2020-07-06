// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import {Logger} from '../../utils/logging'
import {Button} from '../UiKit'
import FingerprintScreenBase from '../Common/FingerprintScreenBase'
import KeyStore from '../../crypto/KeyStore'
import {onDidMount, onWillUnmount} from '../../utils/renderUtils'

import styles from './styles/BiometricAuthScreen.style'

import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'

const errorMessages = defineMessages({
  NOT_RECOGNIZED: {
    id: 'components.send.biometricauthscreen.NOT_RECOGNIZED',
    defaultMessage: '!!!Fingerprint was not recognized try again',
    description: 'some desc',
  },
  SENSOR_LOCKOUT: {
    id: 'components.send.biometricauthscreen.SENSOR_LOCKOUT',
    defaultMessage: '!!!You used too many fingers sensor is disabled',
    description: 'some desc',
  },
  SENSOR_LOCKOUT_PERMANENT: {
    id: 'components.send.biometricauthscreen.SENSOR_LOCKOUT_PERMANENT',
    defaultMessage:
      '!!!You permanently locked out your fingerprint sensor. Use fallback.',
    description: 'some desc',
  },
  DECRYPTION_FAILED: {
    id: 'components.send.biometricauthscreen.DECRYPTION_FAILED',
    defaultMessage: '!!!Fingerprint sensor failed please use fallback',
    description: 'some desc',
  },
  UNKNOWN_ERROR: {
    id: 'components.send.biometricauthscreen.UNKNOWN_ERROR',
    defaultMessage: '!!!Unknown error',
    description: 'some desc',
  },
})

const messages = defineMessages({
  authorizeOperation: {
    id: 'components.send.biometricauthscreen.authorizeOperation',
    defaultMessage: '!!!Authorize operation',
    description: 'some desc',
  },
  useFallbackButton: {
    id: 'components.send.biometricauthscreen.useFallbackButton',
    defaultMessage: '!!!Use fallback',
    description: 'some desc',
  },
  headings1: {
    id: 'components.send.biometricauthscreen.headings1',
    defaultMessage: '!!!Authorize with your',
    description: 'some desc',
  },
  headings2: {
    id: 'components.send.biometricauthscreen.headings2',
    defaultMessage: '!!!fingerprint',
    description: 'some desc',
  },
  cancelButton: {
    id: 'components.send.biometricauthscreen.cancelButton',
    defaultMessage: '!!!Cancel',
    description: 'some desc',
  },
})

const handleOnConfirm = async (
  navigation,
  setError,
  clearError,
  useFallback = false,
  intl,
) => {
  const keyId = navigation.getParam('keyId')
  const onSuccess = navigation.getParam('onSuccess')
  const onFail = navigation.getParam('onFail')

  try {
    const decryptedData = await KeyStore.getData(
      keyId,
      useFallback ? 'SYSTEM_PIN' : 'BIOMETRICS',
      intl.formatMessage(messages.authorizeOperation),
      '',
      intl,
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
      handleOnConfirm(navigation, setError, clearError, false, intl)
    } else {
      Logger.error('BiometricAuthScreen', error)
      setError('UNKNOWN_ERROR')
    }
  }
}

const BiometricAuthScreen = ({cancelScanning, useFallback, error, intl}) => (
  <FingerprintScreenBase
    onGoBack={cancelScanning}
    headings={[
      intl.formatMessage(messages.headings1),
      intl.formatMessage(messages.headings2),
    ]}
    buttons={[
      <Button
        key={'use-fallback'}
        outline
        title={intl.formatMessage(messages.useFallbackButton)}
        onPress={useFallback}
        containerStyle={styles.useFallback}
      />,
    ]}
    error={error && intl.formatMessage(errorMessages[error])}
  />
)

type ExternalProps = {|
  navigation: Navigation,
  intl: any,
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
      {
        error: null,
      },
      {
        setError: (state: State) => (error: ErrorCode) => ({error}),
        clearError: (state: State) => () => ({error: null}),
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
      useFallback: ({navigation, setError, clearError, intl}) => async () => {
        await KeyStore.cancelFingerprintScanning(
          KeyStore.REJECTIONS.SWAPPED_TO_FALLBACK,
        )
        handleOnConfirm(navigation, setError, clearError, true, intl)
      },
    }),
    onWillUnmount(async () => {
      await KeyStore.cancelFingerprintScanning(KeyStore.REJECTIONS.CANCELED)
    }),
    onDidMount(({navigation, setError, clearError, intl}) =>
      handleOnConfirm(navigation, setError, clearError, false, intl),
    ),
  )(BiometricAuthScreen): ComponentType<ExternalProps>),
)
