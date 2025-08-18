import {Platform} from 'react-native'
import * as Keychain from 'react-native-keychain'
import * as LocalAuth from 'expo-local-authentication'

async function write(key: string, value: string) {
  // Keep storage in native keychain but avoid unsupported options; Expo auth will gate access
  return Keychain.setGenericPassword(key, value, {
    service: key,
  }).then((result) => {
    if (result === false)
      return Promise.reject(new Error('Unable to store secret'))
  })
}

async function read(
  key: string,
  _authenticationPrompt: AuthenticationPrompt,
) {
  // Authenticate with Expo (biometrics/OS) first; ignore unsupported prompt fields
  try {
    const result = await LocalAuth.authenticateAsync({
      promptMessage: 'Authorize',
      cancelLabel: 'Cancel',
      fallbackLabel: 'Use Passcode',
    })

    if (!result.success) throw decodeLocalAuthError(result.error)
  } catch (error) {
    // Map any thrown errors as well
    throw decodeLocalAuthError((error as any)?.message)
  }

  let credentials: false | Keychain.UserCredentials
  try {
    credentials = await Keychain.getGenericPassword({
      service: key,
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

export type AuthenticationPrompt = unknown

function decodeLocalAuthError(errorCode?: string) {
  // Map Expo Local Authentication result/error to existing error types
  if (!errorCode) return new CancelledByUser()

  const code = String(errorCode)
  if (
    code.includes('user_cancel') ||
    code.includes('system_cancel') ||
    code.includes('app_cancel') ||
    code.includes('user_fallback')
  )
    return new CancelledByUser()

  if (code.includes('too_many_attempts') || code.includes('lockout'))
    return new TooManyAttempts()

  return new Error(code)
}
