// @flow
/* eslint-disable-next-line */ // $FlowFixMe
import {KeyStoreBridge} from 'NativeModules'
import {Platform} from 'react-native'
import * as Keychain from 'react-native-keychain'
import KeyStore from '../crypto/KeyStore'

export const isFingerprintEncryptionHardwareSupported = async () => {
  if (Platform.OS === 'android') {
    return await KeyStoreBridge.isFingerprintEncryptionHardwareSupported()
  } else if (Platform.OS === 'ios') {
    const supportedBiometrics = await Keychain.getSupportedBiometryType()
    return supportedBiometrics === Keychain.BIOMETRY_TYPE.TOUCH_ID
  }

  throw new Error('Unsupported platform')
}

export const canFingerprintEncryptionBeEnabled = async () => {
  if (Platform.OS === 'android') {
    return await KeyStoreBridge.canFingerprintEncryptionBeEnabled()
  } else if (Platform.OS === 'ios') {
    // prettier-ignore
    const hasFingerprintHardware =
      await isFingerprintEncryptionHardwareSupported()
    const supportedBiometrics = await Keychain.canImplyAuthentication({
      authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
    })
    return supportedBiometrics && hasFingerprintHardware
  }

  throw new Error('Unsupported platform')
}

export const isSystemAuthSupported = async () => {
  if (Platform.OS === 'android') {
    return await KeyStoreBridge.isSystemAuthSupported()
  } else if (Platform.OS === 'ios') {
    const supportedSystemAuth = await Keychain.canImplyAuthentication({
      authenticationType:
        Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
    })
    return supportedSystemAuth
  }

  throw new Error('Unsupported platform')
}

export const isBiometricPromptSupported = async () => {
  if (Platform.OS === 'android') {
    return await KeyStoreBridge.isBiometricPromptSupported()
  } else if (Platform.OS === 'ios') {
    return false
  }

  throw new Error('Unsupported platform')
}

export const recreateAppSignInKeys = async (installationId: string) => {
  await KeyStore.storeData(installationId, 'BIOMETRICS', installationId, '')
  await KeyStore.storeData(installationId, 'SYSTEM_PIN', installationId, '')
}
