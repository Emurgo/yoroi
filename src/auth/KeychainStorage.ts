import {Platform} from 'react-native'
import * as Keychain from 'react-native-keychain'

async function write(key: string, value: string) {
  return Keychain.setGenericPassword(key, value, {
    service: key,
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
  }).then((result) => {
    if (result === false) return Promise.reject(new Error('Unable to store secret'))
  })
}

async function read(key: string, authenticationPrompt: Keychain.Options['authenticationPrompt']) {
  const credentials: false | Keychain.UserCredentials = await Keychain.getGenericPassword({
    service: key,
    authenticationPrompt,
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
  })

  if (!credentials) throw new Error('Failed to load secret')
  return credentials.password
}

async function remove(key: string) {
  return Keychain.resetGenericPassword({
    service: key,
  })
}

export const KeychainStorage = {
  read,
  write,
  remove,
} as const

export async function authOsEnabled() {
  return Platform.select({
    android: () => Keychain.getSupportedBiometryType().then((supportedBioType) => supportedBioType != null),
    ios: () =>
      Promise.all([
        Keychain.canImplyAuthentication({
          authenticationType: Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
        }),
        Keychain.getSupportedBiometryType(),
      ]).then(([canAuth, supportedBioType]) => supportedBioType != null && canAuth),
    default: () => Promise.reject(new Error('OS Authentication is not supported')),
  })()
}

export type AuthenticationPrompt = Keychain.Options['authenticationPrompt']
