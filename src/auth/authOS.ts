import {useMutation, UseMutationOptions, useQuery, UseQueryOptions} from 'react-query'

import {AUTH_METHOD_KEY, AUTH_METHOD_PIN, ENCRYPTED_PIN_HASH_KEY, useMutationWithInvalidations} from '../hooks'
import {WalletMeta} from '../legacy/state'
import storage from '../legacy/storage'
import {Storage} from '../Storage'
import {WalletJSON, walletManager, YoroiWallet} from '../yoroi-wallets'
import {AuthMethod} from '../yoroi-wallets/types'
import * as Keychain from './Keychain'

export const useCanEnableAuthOs = (options?: UseQueryOptions<boolean, Error>) => {
  const query = useQuery({
    queryKey: ['canEnableAuthOs'],
    queryFn: Keychain.canEnableAuthOs,
    ...options,
  })

  return {
    ...query,
    canEnableOsAuth: query.data,
  }
}

export const AUTH_METHOD_OS: AuthMethod = 'os'
export const useEnableAuthWithOs = (
  {authenticationPrompt, storage}: {authenticationPrompt: Keychain.AuthenticationPrompt; storage: Storage},
  options?: UseMutationOptions<void, Error>,
) => {
  const mutation = useMutationWithInvalidations({
    mutationFn: () =>
      storage
        .getItem(INSTALLATION_ID_KEY)
        .then((data) => {
          if (data != null) return data
          throw new Error('Invalid state')
        })
        .then(JSON.parse)
        .then((installationId) => Keychain.saveSecret({key: installationId, value: installationId}))
        .then(({service}) => Keychain.loadSecret({key: service, authenticationPrompt}))
        .then(() => storage.setItem(AUTH_METHOD_KEY, JSON.stringify(AUTH_METHOD_OS)))
        .then(() => storage.getItem(ENCRYPTED_PIN_HASH_KEY))
        .then((pin) => (pin != null ? storage.removeItem(ENCRYPTED_PIN_HASH_KEY) : undefined)),
    ...options,
    invalidateQueries: [['authMethod']],
  })

  return {
    enableAuthWithOs: mutation.mutate,
    ...mutation,
  }
}

export const useAuthWithOs = (
  {authenticationPrompt, storage}: {authenticationPrompt: Keychain.AuthenticationPrompt; storage: Storage},
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
        .then((key) => Keychain.loadSecret({key, authenticationPrompt})),
    ...options,
  })

  return {
    authWithOs: mutation.mutate,
    ...mutation,
  }
}

export const useAuthOsWithEasyConfirmation = (
  {id, authenticationPrompt}: {id: YoroiWallet['id']; authenticationPrompt: Keychain.AuthenticationPrompt},
  options?: UseMutationOptions<string, Error>,
) => {
  const mutation = useMutation({
    mutationFn: () => Keychain.loadSecret({key: id, authenticationPrompt}),
    ...options,
  })

  return {
    authWithOs: mutation.mutate,
    ...mutation,
  }
}

export const useDisableEasyConfirmation = ({id}: {id: YoroiWallet['id']}, options?: UseMutationOptions) => {
  const mutation = useMutationWithInvalidations({
    ...options,
    mutationFn: () => Keychain.resetSecret({key: id}).then(() => walletManager.disableEasyConfirmation()),
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
      Keychain.saveSecret({key: id, value: rootKey}).then(() => walletManager.enableEasyConfirmation()),
    invalidateQueries: [['walletMetas']],
  })

  return {
    ...mutation,
    enableEasyConfirmation: mutation.mutate,
  }
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
    mutationFn: async () => {
      const [[, authMethod], [, pin], [, isOldSystemAuth]] = await storage.multiGet([
        AUTH_METHOD_KEY,
        ENCRYPTED_PIN_HASH_KEY,
        OLD_OS_AUTH_KEY,
      ])
      if (authMethod == null) {
        if (pin != null) {
          return storage.setItem(AUTH_METHOD_KEY, JSON.stringify(AUTH_METHOD_PIN))
        }
        if (isOldSystemAuth != null && JSON.parse(isOldSystemAuth) === true) {
          return storage
            .getItem(INSTALLATION_ID_KEY)
            .then((data) => {
              if (data != null) return data
              throw new Error('Invalid state')
            })
            .then(JSON.parse)
            .then((installationId) => Keychain.saveSecret({key: installationId, value: installationId}))
            .then(() => storage.setItem(AUTH_METHOD_KEY, JSON.stringify(AUTH_METHOD_OS)))
            .then(() => disableAllEasyConfirmation())
        }
      }
    },
    useErrorBoundary: true,
    retry: false,
  })

  return {
    migrate: mutation.mutate,
    ...mutation,
  }
}

// HELPERS
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
