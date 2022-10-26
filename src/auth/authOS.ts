import {useMutation, UseMutationOptions, useQuery, UseQueryOptions} from 'react-query'

import {
  AUTH_METHOD_KEY,
  AUTH_METHOD_PIN,
  ENCRYPTED_PIN_HASH_KEY,
  useMutationWithInvalidations,
  useWallet,
} from '../hooks'
import {WalletMeta} from '../legacy/state'
import storage from '../legacy/storage'
import {Storage} from '../Storage'
import {WalletJSON, walletManager, YoroiWallet} from '../yoroi-wallets'
import {AuthenticationPrompt, canEnableAuthOs, KeychainStorage} from './KeychainStorage'
import {AuthMethod} from './types'

export const useCanEnableAuthOs = (options?: UseQueryOptions<boolean, Error>) => {
  const query = useQuery({
    queryKey: ['canEnableAuthOs'],
    queryFn: canEnableAuthOs,
    suspense: true,
    ...options,
  })

  return {
    ...query,
    canEnableOsAuth: query.data,
  }
}

export const AUTH_METHOD_OS: AuthMethod = 'os'
export const useEnableAuthWithOs = (
  {authenticationPrompt, storage}: {authenticationPrompt: AuthenticationPrompt; storage: Storage},
  options?: UseMutationOptions<void, Error>,
) => {
  const mutation = useMutationWithInvalidations({
    mutationFn: async () => {
      const installationId = await storage
        .getItem(INSTALLATION_ID_KEY)
        .then((data) => {
          if (data != null) return data
          return Promise.reject('Invalid state')
        })
        .then(JSON.parse)

      return KeychainStorage.write(installationId, installationId) // the data here is irrelevant
        .then(() => KeychainStorage.read(installationId, authenticationPrompt))
        .then(() => storage.setItem(AUTH_METHOD_KEY, JSON.stringify(AUTH_METHOD_OS)))
        .then(() => storage.getItem(ENCRYPTED_PIN_HASH_KEY))
        .then((pin) => (pin != null ? storage.removeItem(ENCRYPTED_PIN_HASH_KEY) : undefined))
    },
    ...options,
    invalidateQueries: [['authMethod']],
  })

  return {
    ...mutation,
    enableAuthWithOs: mutation.mutate,
  }
}

export const useAuthWithOs = (
  {authenticationPrompt, storage}: {authenticationPrompt: AuthenticationPrompt; storage: Storage},
  options?: UseMutationOptions<string, Error>,
) => {
  const mutation = useMutation({
    mutationFn: () =>
      storage
        .getItem(INSTALLATION_ID_KEY)
        .then((data) => {
          if (data != null) return data
          throw new Error('Invalid state')
        })
        .then(JSON.parse)
        .then((key: string) => KeychainStorage.read(key, authenticationPrompt)),
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
    mutationFn: () => KeychainStorage.read(id, authenticationPrompt),
    ...options,
  })

  return {
    ...mutation,
    authWithOs: mutation.mutate,
  }
}

export const useDisableEasyConfirmation = ({id}: {id: YoroiWallet['id']}, options?: UseMutationOptions) => {
  const mutation = useMutationWithInvalidations({
    ...options,
    mutationFn: () => KeychainStorage.remove(id).then(() => walletManager.disableEasyConfirmation()),
    invalidateQueries: [['walletMetas']],
  })

  return {
    ...mutation,
    disableEasyConfirmation: mutation.mutate,
  }
}

export const useEnableEasyConfirmation = (
  {id}: {id: YoroiWallet['id']},
  options?: UseMutationOptions<void, Error, string>,
) => {
  const mutation = useMutationWithInvalidations({
    ...options,
    mutationFn: (rootKey: string) =>
      KeychainStorage.write(id, rootKey).then(() => walletManager.enableEasyConfirmation()),
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
      // if there is a wallet selected it needs to trigger the event
      if (wallet !== undefined) await walletManager.disableEasyConfirmation()
    },
    invalidateQueries: [['walletMetas']],
    ...options,
  })

  return {
    ...mutation,
    disableAllEasyConfirmation: mutation.mutate,
  }
}

const OLD_OS_AUTH_KEY = '/appSettings/isSystemAuthEnabled'
export const useMigrateAuthMethod = (storage: Storage) => {
  const mutation = useMutation({
    mutationFn: () => migrateAuthMethod(storage, KeychainStorage),
    useErrorBoundary: true,
    retry: false,
  })

  return {
    ...mutation,
    migrate: mutation.mutate,
  }
}

// HELPERS
export const migrateAuthMethod = async (storage: Storage, keychainStorage: typeof KeychainStorage) => {
  const [[, authMethod], [, pin], [, isOldSystemAuth], [, installationId]] = await storage.multiGet([
    AUTH_METHOD_KEY,
    ENCRYPTED_PIN_HASH_KEY,
    OLD_OS_AUTH_KEY,
    INSTALLATION_ID_KEY,
  ])
  if (authMethod == null && installationId != null) {
    const id = JSON.parse(installationId)
    if (isOldSystemAuth != null && JSON.parse(isOldSystemAuth) === true) {
      await keychainStorage.write(id, id) // the data here is irrelevant
      await storage.setItem(AUTH_METHOD_KEY, JSON.stringify(AUTH_METHOD_OS))
      return disableAllEasyConfirmation()
    }
    if (pin != null) {
      return storage.setItem(AUTH_METHOD_KEY, JSON.stringify(AUTH_METHOD_PIN))
    }
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

const INSTALLATION_ID_KEY = '/appSettings/installationId'
