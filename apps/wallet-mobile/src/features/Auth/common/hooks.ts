import {parseSafe, parseString, useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {App} from '@yoroi/types'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, AppState, Platform} from 'react-native'
import RNKeychain from 'react-native-keychain'
import {useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions} from 'react-query'

import {decryptData, encryptData} from '../../../kernel/encryption/encryption'
import globalMessages from '../../../kernel/i18n/global-messages'
import {logger} from '../../../kernel/logger/logger'
import {Keychain} from '../../../kernel/storage/Keychain'
import {AuthenticationPrompt} from '../../../kernel/storage/KeychainStorage'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'

export const useIsAuthOsSupported = (options?: UseQueryOptions<boolean, Error>) => {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['isAuthOsSupported'],
    queryFn: isAuthOsSupported,
    suspense: true,
    ...options,
  })

  React.useEffect(() => {
    const appStateSubscription = AppState.addEventListener('change', (appState) => {
      // when using OS auth and app is active again needs to check if still enabled
      if (appState === 'active') {
        query.refetch()
      }
    })
    return () => appStateSubscription?.remove()
  }, [query, queryClient])

  if (query.data == null) return false

  return query.data
}

export const useEnableAuthWithOs = (options?: UseMutationOptions<void, Error>) => {
  const storage = useAsyncStorage()
  const queryClient = useQueryClient()
  const {authWithOs: enable, ...mutation} = useAuthWithOs({
    ...options,
    onSuccess: async (data, variables, context) => {
      await enableAuthWithOs(storage)
      queryClient.invalidateQueries(['authSetting'])
      options?.onSuccess?.(data, variables, context)
    },
  })

  return {...mutation, enableAuthWithOs: enable}
}

export const enableAuthWithOs = async (storage: App.Storage) => {
  const settingsStorage = storage.join('appSettings/')
  await settingsStorage.setItem('auth', AUTH_WITH_OS)

  const pin = await settingsStorage.getItem('customPinHash')
  if (pin == null) return

  return settingsStorage.removeItem('customPinHash')
}

export const useAuthWithOs = (
  options?: UseMutationOptions<void, Error>,
  {authenticationPrompt}: {authenticationPrompt?: AuthenticationPrompt} = {},
) => {
  const strings = useStrings()

  const alert = (error: unknown) => {
    if (error instanceof Keychain.Errors.CancelledByUser) return
    if (error instanceof Keychain.Errors.TooManyAttempts) return Alert.alert(strings.error, strings.tooManyAttempts)
    return Alert.alert(strings.error, strings.unknownError)
  }

  const defaultAuthenticationPrompt: AuthenticationPrompt = {
    cancel: strings.cancel,
    title: strings.authorize,
  }

  const mutation = useMutation({
    ...options,
    mutationFn: () => Keychain.authenticate(authenticationPrompt ?? defaultAuthenticationPrompt),
    onError: (error, variables, context) => {
      logger.error('useAuthWithOs: Loging with OS has failed', {error})
      alert(error)
      options?.onError?.(error, variables, context)
    },
  })

  return {
    ...mutation,
    authWithOs: mutation.mutate,
  }
}

export const useAuthOsWithEasyConfirmation = (
  {id, authenticationPrompt}: {id: YoroiWallet['id']; authenticationPrompt?: AuthenticationPrompt},
  options?: UseMutationOptions<string, Error>,
) => {
  const strings = useStrings()

  const alert = (error: unknown) => {
    if (error instanceof Keychain.Errors.CancelledByUser) return
    if (error instanceof Keychain.Errors.TooManyAttempts) return Alert.alert(strings.error, strings.tooManyAttempts)
    return Alert.alert(strings.error, strings.unknownError)
  }

  const defaultAuthenticationPrompt: AuthenticationPrompt = {
    cancel: strings.cancel,
    title: strings.authorize,
  }

  const mutation = useMutation({
    ...options,
    mutationFn: () => Keychain.getWalletKey(id, authenticationPrompt ?? defaultAuthenticationPrompt),
    onError: (error, variables, context) => {
      logger.error('useAuthWithOs: Signing Tx with OS has failed', {error})
      alert(error)
      options?.onError?.(error, variables, context)
    },
  })

  return {
    ...mutation,
    authWithOs: mutation.mutate,
  }
}

export const useCreatePin = (options: UseMutationOptions<void, Error, string>) => {
  const storage = useAsyncStorage()
  const appSettingsStorage = storage.join('appSettings/')
  const mutation = useMutationWithInvalidations({
    invalidateQueries: [['authSetting']],
    mutationFn: async (pin) => {
      const installationId = await appSettingsStorage.getItem('installationId', (data) => data) // LEGACY: installationId is not serialized
      if (!installationId) throw new Error('Invalid installation id')
      const encryptedPinHash = await encryptData(toHex(installationId), pin)
      await appSettingsStorage.setItem('auth', AUTH_WITH_PIN)
      return appSettingsStorage.setItem('customPinHash', encryptedPinHash)
    },
    ...options,
  })

  return {
    createPin: mutation.mutate,
    ...mutation,
  }
}
const toHex = (text: string) => Buffer.from(text, 'utf8').toString('hex')

export const useCheckPin = (options: UseMutationOptions<boolean, Error, string> = {}) => {
  const storage = useAsyncStorage()
  const mutation = useMutation({
    mutationFn: async (pin) => {
      const encryptedPinHash = await storage.join('appSettings/').getItem('customPinHash', parseString)
      if (!encryptedPinHash) throw new Error('missing pin')

      return decryptData(encryptedPinHash, pin)
        .then(() => true)
        .catch((error) => {
          logger.error('useCheckPin: Checking pin has failed', {error})
          if (error instanceof App.Errors.WrongPassword) return false
          throw error
        })
    },
    retry: false,
    ...options,
  })

  return {
    checkPin: mutation.mutate,
    isValid: mutation.data,
    ...mutation,
  }
}

export const useAuthSetting = (options?: UseQueryOptions<AuthSetting, Error>) => {
  const storage = useAsyncStorage()
  const query = useQuery({
    suspense: true,
    queryKey: ['authSetting'],
    queryFn: () => getAuthSetting(storage),
    ...options,
  })

  return query.data
}

export const getAuthSetting = async (storage: App.Storage) => {
  const authSetting = await storage.join('appSettings/').getItem('auth', parseAuthSetting)
  return authSetting ?? undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isAuthSetting = (data: any): data is 'os' | 'pin' | undefined => ['os', 'pin', undefined].includes(data)
const parseAuthSetting = (data: unknown) => {
  const parsed = parseSafe(data)
  return isAuthSetting(parsed) ? parsed : undefined
}

const useStrings = () => {
  const intl = useIntl()

  return {
    unknownError: intl.formatMessage(messages.unknownError),
    tooManyAttempts: intl.formatMessage(messages.tooManyAttempts),
    error: intl.formatMessage(globalMessages.error),
    cancel: intl.formatMessage(globalMessages.cancel),
    authorize: intl.formatMessage(messages.authorize),
  }
}

const messages = defineMessages({
  authorize: {
    id: 'components.send.biometricauthscreen.authorizeOperation',
    defaultMessage: '!!!Authorize',
  },
  tooManyAttempts: {
    id: 'components.send.biometricauthscreen.SENSOR_LOCKOUT',
    defaultMessage: '!!!Too many attempts',
  },
  unknownError: {
    id: 'components.send.biometricauthscreen.UNKNOWN_ERROR',
    defaultMessage: '!!!Unknown error!',
  },
})

export type AuthSetting = 'pin' | 'os' | undefined

export const AUTH_WITH_OS: AuthSetting = 'os'
export const AUTH_WITH_PIN: AuthSetting = 'pin'

export const isAuthOsSupported = () => {
  return Platform.select({
    android: async () =>
      canAuthWithOS({
        platform: 'android',
        supportedBiometryType: await RNKeychain.getSupportedBiometryType(),
      }),
    ios: async () =>
      canAuthWithOS({
        platform: 'ios',
        supportedBiometryType: await RNKeychain.getSupportedBiometryType(),
        canImplyAuthentication: await RNKeychain.canImplyAuthentication({
          authenticationType: RNKeychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
        }),
      }),
    default: () => Promise.reject(new Error('OS Authentication is not supported')),
  })()
}

export const canAuthWithOS = (options: IosAuthOptions | AndroidAuthOptions) => {
  const {platform, supportedBiometryType} = options

  if (platform === 'ios') {
    const {canImplyAuthentication} = options
    if (!canImplyAuthentication) return false

    return !!supportedBiometryType
  }

  if (platform === 'android') {
    return !!supportedBiometryType
  }

  return false
}

type AndroidAuthOptions = {
  platform: 'android'
  supportedBiometryType: `${RNKeychain.BIOMETRY_TYPE}` | null
}

type IosAuthOptions = {
  platform: 'ios'
  supportedBiometryType: `${RNKeychain.BIOMETRY_TYPE}` | null
  canImplyAuthentication: boolean
}
