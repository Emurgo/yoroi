/* eslint-disable @typescript-eslint/no-explicit-any */
import ExtendableError from 'es6-error'
import {NativeModules, Platform} from 'react-native'
import * as Keychain from 'react-native-keychain'

import KeyStore from './KeyStore'

const {KeyStoreBridge} = NativeModules

export class KeysAreInvalid extends ExtendableError {}

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
    const hasBiometricHardware = await isBiometricEncryptionHardwareSupported()
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
  await (KeyStore.storeData as any)(installationId, 'BIOMETRICS', installationId, '')
  await (KeyStore.storeData as any)(installationId, 'SYSTEM_PIN', installationId, '')
}

export const removeAppSignInKeys = async (installationId: string) => {
  await KeyStore.deleteData(installationId, 'BIOMETRICS')
  await KeyStore.deleteData(installationId, 'SYSTEM_PIN')
}

export const ensureKeysValidity = async (walletId: string) => {
  const canBiometricsBeUsed = await canBiometricEncryptionBeEnabled()
  const isKeyValid = await KeyStore.isKeyValid(walletId, 'BIOMETRICS')

  if (!isKeyValid || !canBiometricsBeUsed) {
    throw new KeysAreInvalid()
  }
}
