import {parseString} from '@yoroi/common'

import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {decryptData, encryptData} from '../encryption/encryption'
import {rootStorage} from './rootStorage'

type StorageKey = `${string}-MASTER_PASSWORD` | string
export const EncryptedStorageKeys = {
  // MASTER_PASSWORD is legacy this b.s abstraction means xpriv
  // key here means storage-key
  xPrivKey: (id: YoroiWallet['id']): StorageKey => `${id}-MASTER_PASSWORD`,
}

// private is stored encrypted at root level of keystore/
const keyStorage = rootStorage.join('keystore/')
// public per account is stored at keystore/${id}/${account} not encrypted for now
const publicStorageMaker = (id: YoroiWallet['id']) => keyStorage.join(`${id}/`)

export const EncryptedStorage = {
  async read(key: StorageKey, password: string) {
    const encrypted = await keyStorage.getItem(key, parseString)
    if (encrypted == null) {
      throw new Error('RootKey invalid')
    }

    return decryptData(encrypted, password)
  },

  // value is a hex, no leading `0x` I.e "DEAD"
  async write(key: StorageKey, value: string, password: string) {
    const encrypted = await encryptData(value, password)

    return keyStorage.setItem(key, encrypted)
  },

  remove(key: StorageKey) {
    return keyStorage.removeItem(key)
  },
} as const

export const makeWalletEncryptedStorage = (id: YoroiWallet['id']) => {
  const xPrivKey = EncryptedStorageKeys.xPrivKey(id)
  const xPubStorage = publicStorageMaker(id)

  return {
    xpriv: {
      read: (password: string) => EncryptedStorage.read(xPrivKey, password),
      write: (value: string, password: string) => EncryptedStorage.write(xPrivKey, value, password),
      remove: () => EncryptedStorage.remove(xPrivKey),
    },
    xpub: {
      read: (accountVisual: number) => xPubStorage.getItem(accountVisual.toString(), parseString),
      write: (accountVisual: number, accountPubKeyHex: string) =>
        xPubStorage.setItem(accountVisual.toString(), accountPubKeyHex),
      remove: (accountVisual: number) => xPubStorage.removeItem(accountVisual.toString()),
      clear: () => keyStorage.removeFolder(`${id}/`),
    },
  } as const
}

export type WalletEncryptedStorage = ReturnType<typeof makeWalletEncryptedStorage>
export type EncryptedStorage = typeof EncryptedStorage
