import {CancelledByUser, TooManyAttempts} from '@yoroi/types'

import * as LocalAuth from 'expo-local-authentication'
import {Platform} from 'react-native'
import * as Keychain from 'react-native-keychain'

async function write(key: string, value: string) {
  // Keep storage in native keychain but avoid unsupported options; Expo auth will gate access
  return Keychain.setGenericPassword(key, value, {
    service: key,
  }).then((result) => {
    if (result == false)
      return Promise.reject(new Error('Unable to store secret'))
    return result
  })
}

async function read(key: string, _authenticationPrompt: AuthenticationPrompt) {
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
    const errorMessage =
      error instanceof Error ? error.message : String(error ?? 'Unknown error')
    throw decodeLocalAuthError(errorMessage)
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

type KeychainError = Error & {
  code?: string | number
  message?: string
}

const errorDecoder = Platform.select<(error: unknown) => Error>({
  android: (error) => {
    const keychainError = error as KeychainError
    const message = keychainError?.message ?? ''
    if (/code: 13/.test(message)) return new CancelledByUser()
    if (/code: 10/.test(message)) return new CancelledByUser()
    if (/code: 7/.test(message)) return new TooManyAttempts()

    return error instanceof Error ? error : new Error(String(error))
  },

  ios: (error) => {
    const keychainError = error as KeychainError
    if (keychainError?.code === '-128') return new CancelledByUser()
    // if too many attempts, iOS will fallback to PIN,
    // if incorrect pin, sensor would be disabled (app will trigger pin creation)

    return error instanceof Error ? error : new Error(String(error))
  },

  default: (_) => new Error('Unknown keychain error'),
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
