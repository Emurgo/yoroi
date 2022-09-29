import {useMutation, UseMutationOptions, useQuery, UseQueryOptions} from 'react-query'

import {AUTH_METHOD_KEY, ENCRYPTED_PIN_HASH_KEY, useMutationWithInvalidations} from '../hooks'
import {Storage} from '../Storage'
import {walletManager, YoroiWallet} from '../yoroi-wallets'
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

const AUTH_METHOD_OS: AuthMethod = 'os'
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

const INSTALLATION_ID_KEY = '/appSettings/installationId'
