// @flow
/* eslint-disable-next-line */ // $FlowFixMe
import {KeyStoreBridge} from 'NativeModules'
import {Platform} from 'react-native'
import * as Keychain from 'react-native-keychain'

export const isFingerprintEncryptionHardwareSupported = async () => {
  if (Platform.OS === 'android') {
    return await KeyStoreBridge.isFingerprintEncryptionHardwareSupported()
  } else if (Platform.OS === 'ios') {
    const supportedBiometry = await Keychain.getSupportedBiometryType()
    return supportedBiometry === Keychain.BIOMETRY_TYPE.TOUCH_ID
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
    const supportedBiometry = await Keychain.canImplyAuthentication([
      Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
    ])
    return supportedBiometry && hasFingerprintHardware
  }

  throw new Error('Unsupported platform')
}

export const isSystemAuthSupported = async () => {
  if (Platform.OS === 'android') {
    return await KeyStoreBridge.isSystemAuthSupported()
  } else if (Platform.OS === 'ios') {
    const supportedSystemAuth = await Keychain.canImplyAuthentication([
      Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
    ])
    return supportedSystemAuth
  }

  throw new Error('Unsupported platform')
}
