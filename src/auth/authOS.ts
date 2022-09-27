import {useMutation, UseMutationOptions, useQuery, UseQueryOptions} from 'react-query'

import {useMutationWithInvalidations} from '../hooks'
import {isEmptyString} from '../legacy/utils'
import {Storage} from '../Storage'
import {walletManager, YoroiWallet} from '../yoroi-wallets'
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

export const useAuthMethod = (storage: Storage, options?: UseQueryOptions<AuthMethodState, Error>) => {
  const query = useQuery({
    suspense: true,
    queryKey: ['authMethod'],
    queryFn: () =>
      Promise.resolve(authMethodKey)
        .then(storage.getItem)
        .then((storedAuthMethod) => (!isEmptyString(storedAuthMethod) ? storedAuthMethod : '""'))
        .then(JSON.parse)
        .then((parsedAuthMethod) => {
          switch (parsedAuthMethod) {
            case 'pin':
              return {
                isPIN: true,
                isOS: false,
                isNone: false,
              } as const
            case 'os':
              return {
                isPIN: false,
                isOS: true,
                isNone: false,
              } as const
            default:
              return {
                isPIN: false,
                isOS: false,
                isNone: true,
              } as const
          }
        }),
    ...options,
  })

  return {
    authMethod: query.data,
    ...query,
  }
}

export const useSaveAuthMethod = (storage: Storage, options?: UseMutationOptions<void, Error, AuthMethod>) => {
  const mutation = useMutationWithInvalidations({
    mutationFn: (authMethod) => storage.setItem(authMethodKey, JSON.stringify(authMethod)),
    invalidateQueries: [['authMethod']],
    ...options,
  })

  return {
    ...mutation,
    saveAuthMethod: mutation.mutate,
  }
}

export const useEnableAuthWithOs = (
  {authenticationPrompt, storage}: {authenticationPrompt: Keychain.AuthenticationPrompt; storage: Storage},
  options?: UseMutationOptions<void, Error>,
) => {
  const mutation = useMutationWithInvalidations({
    mutationFn: () =>
      storage
        .getItem(installationIdKey)
        .then((data) => {
          if (data != null) return data
          throw new Error('Invalid state')
        })
        .then(JSON.parse)
        .then((installationId) => Keychain.saveSecret({key: installationId, value: installationId}))
        .then(({service}) => Keychain.loadSecret({key: service, authenticationPrompt}))
        .then(() => Promise.resolve<AuthMethod>('os'))
        .then((authMethod: AuthMethod) => storage.setItem(authMethodKey, JSON.stringify(authMethod))),
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
        .getItem(installationIdKey)
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

const authMethodKey = '/appSettings/authMethod'
const installationIdKey = '/appSettings/installationId'

type AuthMethod = 'pin' | 'os'
type AuthMethodState =
  | {
      isPIN: true
      isOS: false
      isNone: false
    }
  | {
      isPIN: false
      isOS: true
      isNone: false
    }
  | {
      isPIN: false
      isOS: false
      isNone: true
    }
