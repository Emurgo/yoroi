/* eslint-disable @typescript-eslint/no-explicit-any */
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
  let credentials: false | Keychain.UserCredentials
  try {
    credentials = await Keychain.getGenericPassword({
      service: key,
      authenticationPrompt,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
    })
  } catch (error) {
    throw errorDecoder(error)
  }

  if (!credentials) throw new Error('Failed to load secret')
  return credentials.password
}

async function remove(key: string) {
  return Keychain.resetGenericPassword({
    service: key,
  })
}

class CancelledByUser extends Error {}
class TooManyAttempts extends Error {}

const Errors = {
  CancelledByUser,
  TooManyAttempts,
}

export const KeychainStorage = {
  read,
  write,
  remove,
  Errors,
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

// react-native-keychain doesn't normalize the errors, iOS = `Error.code`
// Android the code is inside the message i.e "code 7: Too many attempts"
const errorDecoder = Platform.select({
  android: (error: any) => {
    if (/code: 13/.test(error?.message)) return new CancelledByUser() // cancelled by user

    // iOS it will fallback to PIN, if wrong pin, sensor would be disabled (app will trigger pin creation)
    if (/code: 7/.test(error?.message)) return new TooManyAttempts()

    return error
  },

  ios: (error: any) => {
    if (error?.code === '-128') return new CancelledByUser() // cancelled by user

    return error
  },

  default: (_) => new Error(),
})

export type AuthenticationPrompt = Keychain.Options['authenticationPrompt']
