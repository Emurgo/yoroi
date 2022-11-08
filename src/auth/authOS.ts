import React from 'react'
import {AppState} from 'react-native'
import {useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions} from 'react-query'

import {getAuthSetting, useMutationWithInvalidations, useWallet} from '../hooks'
import {WalletMeta} from '../legacy/state'
import storage from '../legacy/storage'
import {
  AUTH_SETTINGS_KEY,
  AUTH_WITH_OS,
  AUTH_WITH_PIN,
  ENCRYPTED_PIN_HASH_KEY,
  INSTALLATION_ID_KEY,
  OLD_OS_AUTH_KEY,
} from '../Settings/types'
import {Storage} from '../Storage'
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
  {authenticationPrompt, storage}: {authenticationPrompt: AuthenticationPrompt; storage: Storage},
  options?: UseMutationOptions<void, Error>,
) => {
  const mutation = useMutationWithInvalidations({
    mutationFn: () =>
      Keychain.authenticate(authenticationPrompt)
        .then(() => storage.setItem(AUTH_SETTINGS_KEY, JSON.stringify(AUTH_WITH_OS)))
        .then(() => storage.getItem(ENCRYPTED_PIN_HASH_KEY))
        .then((pin) => (pin != null ? storage.removeItem(ENCRYPTED_PIN_HASH_KEY) : undefined)),
    ...options,
    invalidateQueries: [['authSetting']],
  })

  return {
    ...mutation,
    enableAuthWithOs: mutation.mutate,
  }
}

export const useAuthWithOs = (
  {authenticationPrompt}: {authenticationPrompt: AuthenticationPrompt; storage: Storage},
  options?: UseMutationOptions<void, Error>,
) => {
  const mutation = useMutationWithInvalidations({
    invalidateQueries: [['authSetting']],
    mutationFn: () => Keychain.authenticate(authenticationPrompt),
    ...options,
  })

  return {
    ...mutation,
    authWithOs: mutation.mutate,
  }
}

export const useAuthOsWithEasyConfirmation = (
  {id, authenticationPrompt}: {id: YoroiWallet['id']; authenticationPrompt: AuthenticationPrompt},
  options?: UseMutationOptions<string, Error>,
) => {
  const mutation = useMutation({
    mutationFn: () => Keychain.getWalletKey(id, authenticationPrompt),
    ...options,
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
const disableAllEasyConfirmation = () =>
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

export const migrateAuthSetting = async (storage: Storage) => {
  const authSetting = await getAuthSetting(storage)
  const isFirstRun = await storage.getItem(INSTALLATION_ID_KEY).then((data) => data === null)
  const isLegacyAuth = authSetting == null && !isFirstRun
  if (!isLegacyAuth) return

  const isAuthWithOS = await storage.getItem(OLD_OS_AUTH_KEY).then(Boolean)
  if (isAuthWithOS) {
    await storage.setItem(AUTH_SETTINGS_KEY, JSON.stringify(AUTH_WITH_OS))
    return disableAllEasyConfirmation()
  }

  const isAuthWithPIN = await storage.getItem(ENCRYPTED_PIN_HASH_KEY).then(Boolean)
  if (isAuthWithPIN) {
    return storage.setItem(AUTH_SETTINGS_KEY, JSON.stringify(AUTH_WITH_PIN))
  }
}
