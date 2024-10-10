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

// react-native-keychain doesn't normalize the errors
// iOS = `Error.code`
// Android = Error.message
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errorDecoder = Platform.select<(error: any) => Error>({
  android: (error) => {
    if (/code: 13/.test(error?.message)) return new CancelledByUser()
    if (/code: 10/.test(error?.message)) return new CancelledByUser()
    if (/code: 7/.test(error?.message)) return new TooManyAttempts()

    return error
  },

  ios: (error) => {
    if (error?.code === '-128') return new CancelledByUser()
    // if too many attempts, iOS will fallback to PIN,
    // if incorrect pin, sensor would be disabled (app will trigger pin creation)

    return error
  },

  default: (_) => new Error(),
})

export type AuthenticationPrompt = Keychain.Options['authenticationPrompt']
