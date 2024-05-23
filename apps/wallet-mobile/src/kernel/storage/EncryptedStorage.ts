import {parseString} from '@yoroi/common'

import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {decryptData, encryptData} from '../../yoroi-wallets/encryption/encryption'
import {rootStorage} from './rootStorage'

type StorageKey = `${string}-MASTER_PASSWORD`
export const EncryptedStorageKeys = {
  rootKey: (id: YoroiWallet['id']): StorageKey => `${id}-MASTER_PASSWORD`,
}

const keyStorage = rootStorage.join('keystore/')

export const EncryptedStorage = {
  async read(key: StorageKey, password: string) {
    const encrypted = await keyStorage.getItem(key, parseString)
    if (encrypted == null) {
      throw new Error('RootKey invalid')
    }

    return decryptData(encrypted, password)
  },

  // value is a hex string, no leading `0x` I.e "DEAD"
  async write(key: StorageKey, value: string, password: string) {
    const encrypted = await encryptData(value, password)

    return keyStorage.setItem(key, encrypted)
  },

  remove(key: StorageKey) {
    return keyStorage.removeItem(key)
  },
} as const

export const makeWalletEncryptedStorage = (id: YoroiWallet['id']) => {
  const rootKey = EncryptedStorageKeys.rootKey(id)

  return {
    rootKey: {
      read: (password: string) => EncryptedStorage.read(rootKey, password),
      write: (value: string, password: string) => EncryptedStorage.write(rootKey, value, password),
      remove: () => EncryptedStorage.remove(rootKey),
    },
  } as const
}

export type WalletEncryptedStorage = ReturnType<typeof makeWalletEncryptedStorage>
export type EncryptedStorage = typeof EncryptedStorage
