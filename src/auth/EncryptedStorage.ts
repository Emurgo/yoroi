import {decryptData, encryptData} from '../legacy/commonUtils'
import storage from '../legacy/storage'
import {YoroiWallet} from '../yoroi-wallets'

type StorageKey = `/keystore/${string}-MASTER_PASSWORD`
export const EncryptedStorageKeys = {
  rootKey: (id: YoroiWallet['id']): StorageKey => `/keystore/${id}-MASTER_PASSWORD`,
}

export const EncryptedStorage = {
  async read(key: StorageKey, password: string) {
    const encrypted = await storage.read<string | null>(key)
    if (encrypted == null) {
      throw new Error('RootKey invalid')
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
