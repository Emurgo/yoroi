import ExtendableError from 'es6-error'
import {useMutation, UseMutationOptions} from 'react-query'

import {decryptData, encryptData} from '../legacy/commonUtils'
import storage from '../legacy/storage'
import {YoroiWallet} from '../yoroi-wallets'

export class CredentialsNotFound extends ExtendableError {}

export const useRevealMasterKey = (
  {id}: {id: YoroiWallet['id']},
  options?: UseMutationOptions<string, Error, string>,
) => {
  const mutation = useMutation({
    mutationFn: (password) => MasterKey(id).reveal(password),
    ...options,
    retry: false,
  })

  return {
    reveal: mutation.mutate,
    ...mutation,
  }
}

export const useKeepMasterKey = (
  {id}: {id: YoroiWallet['id']},
  options?: UseMutationOptions<void, Error, {password: string; masterKey: string}>,
) => {
  const mutation = useMutation({
    ...options,
    mutationFn: ({password, masterKey}) => MasterKey(id).keep(password, masterKey),
  })

  return {
    reveal: mutation.mutate,
    ...mutation,
  }
}

export function MasterKey(id: YoroiWallet['id']) {
  const mpKey = `${storagePrefix}/${id}-MASTER_PASSWORD`

  return {
    async reveal(password: string) {
      const encrypted = await storage.read<string | null>(mpKey)
      if (encrypted == null) {
        throw new CredentialsNotFound('MasterKey invalid state.')
      }

      return decryptData(encrypted, password)
    },

    /**
     * @param password {string}
     * @param masterKey {string} Hex string without leading `0x` I.e "DEAD"
     */
    async keep(password: string, masterKey: string) {
      const encrypted = await encryptData(masterKey, password)

      return storage.write(mpKey, encrypted)
    },

    discard() {
      return storage.remove(mpKey)
    },
  }
}

const storagePrefix = '/keystore'

export default MasterKey

export type MasterKey = typeof MasterKey
