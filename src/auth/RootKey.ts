import ExtendableError from 'es6-error'
import {useMutation, UseMutationOptions, useQuery, UseQueryOptions} from 'react-query'

import {decryptData, encryptData} from '../legacy/commonUtils'
import storage from '../legacy/storage'
import {YoroiWallet} from '../yoroi-wallets'

export class CredentialsNotFound extends ExtendableError {}

export const useRevealRootKey = (
  {id, password}: {id: YoroiWallet['id']; password: string},
  options?: UseQueryOptions<string, Error>,
) => {
  const query = useQuery({
    enabled: false,
    retry: false,
    queryKey: ['rootKey'],
    queryFn: () => RootKey(id).reveal(password),
    ...options,
  })

  return {
    reveal: query.refetch,
    ...query,
  }
}

export const useKeepRootKey = (
  {id}: {id: YoroiWallet['id']},
  options?: UseMutationOptions<void, Error, {password: string; rootKey: string}>,
) => {
  const mutation = useMutation({
    ...options,
    mutationFn: ({password, rootKey}) => RootKey(id).keep(password, rootKey),
  })

  return {
    reveal: mutation.mutate,
    ...mutation,
  }
}

export function RootKey(id: YoroiWallet['id']) {
  const mpKey = `${storagePrefix}/${id}-MASTER_PASSWORD`

  return {
    async reveal(password: string) {
      const encrypted = await storage.read<string | null>(mpKey)
      if (encrypted == null) {
        throw new CredentialsNotFound('RootKey invalid state.')
      }

      return decryptData(encrypted, password)
    },

    /**
     * @param password {string}
     * @param rootKey {string} Hex string without leading `0x` I.e "DEAD"
     */
    async keep(password: string, rootKey: string) {
      const encrypted = await encryptData(rootKey, password)

      return storage.write(mpKey, encrypted)
    },

    discard() {
      return storage.remove(mpKey)
    },
  }
}

const storagePrefix = '/keystore'

export default RootKey

export type RootKey = typeof RootKey
