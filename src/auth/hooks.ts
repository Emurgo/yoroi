import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, AppState} from 'react-native'
import {useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions} from 'react-query'

import {useMutationWithInvalidations, useWallet} from '../hooks'
import globalMessages from '../i18n/global-messages'
import {decryptData, encryptData} from '../legacy/commonUtils'
import {WrongPassword} from '../legacy/errors'
import {WalletMeta} from '../legacy/state'
import storage from '../legacy/storage'
import {SettingsStorageKeys, Storage} from '../Storage'
import {WalletJSON, walletManager, YoroiWallet} from '../yoroi-wallets'
import {Keychain} from './Keychain'
import {AuthenticationPrompt, authOsEnabled} from './KeychainStorage'

export const useAuthOsEnabled = (options?: UseQueryOptions<boolean, Error>) => {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['authOsEnabled'],
    queryFn: authOsEnabled,
    suspense: true,
    ...options,
  })

  React.useEffect(() => {
    const appStateSubscription = AppState.addEventListener('change', async (appState) => {
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

export const useEnableAuthWithOs = (
  {authenticationPrompt, storage}: {authenticationPrompt?: AuthenticationPrompt; storage: Storage},
  options?: UseMutationOptions<void, Error>,
) => {
  const {authWithOs: enableAuthWithOs, ...mutation} = useAuthWithOs(
    {
      ...options,
      onSuccess: (data, variables, context) => {
        storage
          .setItem(SettingsStorageKeys.Auth, JSON.stringify(AUTH_WITH_OS))
          .then(() => storage.getItem(SettingsStorageKeys.Pin))
          .then((pin) => (pin != null ? storage.removeItem(SettingsStorageKeys.Pin) : undefined))
        options?.onSuccess?.(data, variables, context)
      },
    },
    {authenticationPrompt},
  )

  return {...mutation, enableAuthWithOs}
}

export const useAuthWithOs = (
  options?: UseMutationOptions<void, Error>,
  {authenticationPrompt}: {authenticationPrompt?: AuthenticationPrompt} = {},
) => {
  const strings = useStrings()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const alert = (error: unknown) => {
    if (error instanceof Keychain.Errors.CancelledByUser) return
    if (error instanceof Keychain.Errors.TooManyAttempts) return Alert.alert(strings.error, strings.tooManyAttempts)
    return Alert.alert(strings.error, strings.unknownError)
  }

  const primaryAuthenticationPrompt: AuthenticationPrompt = {
    cancel: strings.cancel,
    title: strings.authorize,
  }

  const mutation = useMutationWithInvalidations({
    ...options,
    invalidateQueries: [['authSetting']],
    mutationFn: () => Keychain.authenticate(authenticationPrompt ?? primaryAuthenticationPrompt),
    onError: (error, variables, context) => {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const alert = (error: any) => {
    if (error instanceof Keychain.Errors.CancelledByUser) return
    if (error instanceof Keychain.Errors.TooManyAttempts) return Alert.alert(strings.error, strings.tooManyAttempts)
    return Alert.alert(strings.error, strings.unknownError)
  }

  const primaryAuthenticationPrompt: AuthenticationPrompt = {
    cancel: strings.cancel,
    title: strings.authorize,
  }

  const mutation = useMutation({
    ...options,
    mutationFn: () => Keychain.getWalletKey(id, authenticationPrompt ?? primaryAuthenticationPrompt),
    onError: (error, variables, context) => {
      alert(error)
      options?.onError?.(error, variables, context)
    },
  })

  return {
    ...mutation,
    authWithOs: mutation.mutate,
  }
}

export const useDisableEasyConfirmation = (wallet: YoroiWallet, options?: UseMutationOptions) => {
  const mutation = useMutationWithInvalidations({
    ...options,
    mutationFn: () => walletManager.disableEasyConfirmation(wallet),
    invalidateQueries: [['walletMetas']],
  })

  return {
    ...mutation,
    disableEasyConfirmation: mutation.mutate,
  }
}

export const useEnableEasyConfirmation = (wallet: YoroiWallet, options?: UseMutationOptions<void, Error, string>) => {
  const mutation = useMutationWithInvalidations({
    ...options,
    mutationFn: (password: string) => walletManager.enableEasyConfirmation(wallet, password),
    invalidateQueries: [['walletMetas']],
  })

  return {
    ...mutation,
    enableEasyConfirmation: mutation.mutate,
  }
}

export const useEasyConfirmationEnabled = (wallet: YoroiWallet) => {
  useWallet(wallet, 'easy-confirmation')

  return wallet.isEasyConfirmationEnabled
}

export const useDisableAllEasyConfirmation = (
  wallet: YoroiWallet | undefined,
  options?: UseMutationOptions<void, Error>,
) => {
  const mutation = useMutationWithInvalidations({
    mutationFn: async () => {
      await disableAllEasyConfirmation()
      // if there is a wallet selected it needs to trigger event for subcribers
      if (wallet !== undefined) await walletManager.disableEasyConfirmation(wallet)
    },
    invalidateQueries: [['walletMetas']],
    ...options,
  })

  return {
    ...mutation,
    disableAllEasyConfirmation: mutation.mutate,
  }
}

export const disableAllEasyConfirmation = () =>
  storage
    .keys('/wallet/', false)
    .then((keys) =>
      Promise.all([
        storage.readMany(keys.map((walletId) => `/wallet/${walletId}`)),
        storage.readMany(keys.map((walletId) => `/wallet/${walletId}/data`)),
      ]),
    )
    .then(async ([metas, wallets]) => {
      const metaUpdates: Array<[string, WalletMeta]> = []
      for (const [walletPath, meta] of metas) {
        if ((meta as WalletMeta)?.isEasyConfirmationEnabled) {
          metaUpdates.push([walletPath, {...meta, isEasyConfirmationEnabled: false}])
        }
      }
      const walletUpdates: Array<[string, WalletJSON]> = []
      for (const [walletPath, wallet] of wallets) {
        if ((wallet as WalletJSON)?.isEasyConfirmationEnabled) {
          walletUpdates.push([walletPath, {...wallet, isEasyConfirmationEnabled: false}])
        }
      }
      return [metaUpdates, walletUpdates]
    })
    .then(async ([metaUpdates, walletUpdates]) => {
      for (const [key, value] of metaUpdates) {
        await storage.write(key, value)
      }
      for (const [key, value] of walletUpdates) {
        await storage.write(key, value)
      }
    })

export const useCreatePin = (storage: Storage, options: UseMutationOptions<void, Error, string>) => {
  const mutation = useMutationWithInvalidations({
    invalidateQueries: [['authSetting']],
    mutationFn: async (pin) => {
      const installationId = await storage.getItem('/appSettings/installationId')
      if (!installationId) throw new Error('Invalid installation id')
      const encryptedPinHash = await encryptData(toHex(installationId), pin)
      await storage.setItem(SettingsStorageKeys.Auth, JSON.stringify(AUTH_WITH_PIN))
      return storage.setItem(SettingsStorageKeys.Pin, JSON.stringify(encryptedPinHash))
    },
    ...options,
  })

  return {
    createPin: mutation.mutate,
    ...mutation,
  }
}
const toHex = (text: string) => Buffer.from(text, 'utf8').toString('hex')

export const useCheckPin = (storage: Storage, options: UseMutationOptions<boolean, Error, string> = {}) => {
  const mutation = useMutation({
    mutationFn: (pin) =>
      storage
        .getItem(SettingsStorageKeys.Pin)
        .then((data) => {
          if (!data) throw new Error('missing pin')
          return data
        })
        .then(JSON.parse)
        .then((encryptedPinHash: string) => decryptData(encryptedPinHash, pin))
        .then(() => true)
        .catch((error) => {
          if (error instanceof WrongPassword) return false
          throw error
        }),
    retry: false,
    ...options,
  })

  return {
    checkPin: mutation.mutate,
    isValid: mutation.data,
    ...mutation,
  }
}

export const useAuthSetting = (storage: Storage, options?: UseQueryOptions<AuthSetting, Error>) => {
  const query = useQuery({
    suspense: true,
    queryKey: ['authSetting'],
    queryFn: () => getAuthSetting(storage),
    ...options,
  })

  return query.data
}

export const getAuthSetting = async (storage: Storage) => {
  const authSetting = parseAuthSetting(await storage.getItem(SettingsStorageKeys.Auth))
  if (isAuthSetting(authSetting)) return authSetting
  return Promise.reject(new Error('useAuthSetting invalid data'))
}

const parseAuthSetting = (data: unknown) => {
  if (!data) return undefined
  try {
    return JSON.parse(data as string)
  } catch (error) {
    return undefined
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isAuthSetting = (data: any): data is 'os' | 'pin' | undefined => ['os', 'pin', undefined].includes(data)

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
