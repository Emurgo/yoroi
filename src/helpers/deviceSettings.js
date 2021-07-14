// @flow
/* eslint-disable-next-line */
import {Platform, NativeModules} from 'react-native'
import * as Keychain from 'react-native-keychain'
import KeyStore from '../crypto/KeyStore'

const {KeyStoreBridge} = NativeModules

export const isBiometricEncryptionHardwareSupported = async () => {
  if (Platform.OS === 'android') {
    return await KeyStoreBridge.isFingerprintEncryptionHardwareSupported()
  } else if (Platform.OS === 'ios') {
    const supportedBiometrics = await Keychain.getSupportedBiometryType()
    return (
      supportedBiometrics === Keychain.BIOMETRY_TYPE.TOUCH_ID || supportedBiometrics === Keychain.BIOMETRY_TYPE.FACE_ID
    )
  }

  throw new Error('Unsupported platform')
}

export const canBiometricEncryptionBeEnabled = async () => {
  if (Platform.OS === 'android') {
    return await KeyStoreBridge.canFingerprintEncryptionBeEnabled()
  } else if (Platform.OS === 'ios') {
    // prettier-ignore
    const hasBiometricHardware =
      await isBiometricEncryptionHardwareSupported()
    const supportedBiometrics = await Keychain.canImplyAuthentication({
      authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
    })
    return supportedBiometrics && hasBiometricHardware
  }

  throw new Error('Unsupported platform')
}

export const isSystemAuthSupported = async () => {
  if (Platform.OS === 'android') {
    return await KeyStoreBridge.isSystemAuthSupported()
  } else if (Platform.OS === 'ios') {
    const supportedSystemAuth = await Keychain.canImplyAuthentication({
      authenticationType: Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
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

export const removeAppSignInKeys = async (installationId: string) => {
  await KeyStore.deleteData(installationId, 'BIOMETRICS')
  await KeyStore.deleteData(installationId, 'SYSTEM_PIN')
}
