import ExtendableError from 'es6-error'
import {useMutation, UseMutationOptions, useQuery, UseQueryOptions} from 'react-query'

import {decryptData, encryptData} from '../legacy/commonUtils'
import storage from '../legacy/storage'
import {YoroiWallet} from '../yoroi-wallets'

export class CredentialsNotFound extends ExtendableError {}

export const useReadRootKey = (
  {id, password}: {id: YoroiWallet['id']; password: string},
  options?: UseQueryOptions<string, Error>,
) => {
  const query = useQuery({
    enabled: false,
    retry: false,
    queryKey: ['rootKey'],
    queryFn: () => EncryptedStorage.read(StorageKeys.rootKey(id), password),
    ...options,
  })

  return {
    readRootKey: query.refetch,
    ...query,
  }
}

export const useWriteRootKey = (
  {id}: {id: YoroiWallet['id']},
  options?: UseMutationOptions<void, Error, {password: string; rootKey: string}>,
) => {
  const mutation = useMutation({
    ...options,
    mutationFn: ({password, rootKey}) => EncryptedStorage.write(StorageKeys.rootKey(id), rootKey, password),
  })

  return {
    writeRootKey: mutation.mutate,
    ...mutation,
  }
}

type StorageKey = `/keystore/${string}-MASTER_PASSWORD`
export const StorageKeys = {
  rootKey: (id: YoroiWallet['id']): StorageKey => `/keystore/${id}-MASTER_PASSWORD`,
}

export const EncryptedStorage = {
  async read(key: StorageKey, password: string) {
    const encrypted = await storage.read<string | null>(key)
    if (encrypted == null) {
      throw new CredentialsNotFound('RootKey invalid state.')
    }

    return decryptData(encrypted, password)
  },

  // value is a hex string, no leading `0x` I.e "DEAD"
  async write(key: StorageKey, value: string, password: string) {
    const encrypted = await encryptData(value, password)

    return storage.write(key, encrypted)
  },

  remove(key: StorageKey) {
    return storage.remove(key)
  },
}

export type EncryptedStorage = typeof EncryptedStorage
