import {hex, parseString} from '@yoroi/common'

import {freeze} from 'immer'

import {decryptData} from '../crypto/decrypt-data'
import {encryptData} from '../crypto/encrypt-data'
import {rootStorage} from './storages'

type StorageKey = `${string}-MASTER_PASSWORD` | string
export const EncryptedStorageKeys = {
  xPrivKey: (id: string): StorageKey => `${id}-MASTER_PASSWORD`,
}

const keyStorage = rootStorage.join('keystore/')
const publicStorageMaker = (id: string) => keyStorage.join(`${id}/`)

export const EncryptedStorage = {
  async read(key: StorageKey, password: string) {
    const encrypted = await keyStorage.getItem(key, parseString)
    if (encrypted == null) {
      throw new Error('RootKey invalid')
    }

    return decryptData({
      encryptedData: hex(encrypted),
      secretKey: hex.fromUtf8(password),
    })
  },

  // value is a hex, no leading `0x` I.e "DEAD"
  async write(key: StorageKey, value: string, password: string) {
    const encrypted = await encryptData({
      plainData: hex(value),
      secretKey: hex.fromUtf8(password),
    })

    return keyStorage.setItem(key, encrypted)
  },

  remove(key: StorageKey) {
    return keyStorage.removeItem(key)
  },
} as const

export const makeWalletEncryptedStorage = (id: string) => {
  const xPrivKey = EncryptedStorageKeys.xPrivKey(id)
  const xPubStorage = publicStorageMaker(id)

  return freeze({
    xpriv: {
      read: (password: string) => EncryptedStorage.read(xPrivKey, password),
      write: (value: string, password: string) =>
        EncryptedStorage.write(xPrivKey, value, password),
      remove: () => EncryptedStorage.remove(xPrivKey),
    },
    xpub: {
      read: (accountVisual: number) =>
        xPubStorage.getItem(accountVisual.toString(), parseString),
      write: (accountVisual: number, accountPubKeyHex: string) =>
        xPubStorage.setItem(accountVisual.toString(), accountPubKeyHex),
      remove: (accountVisual: number) =>
        xPubStorage.removeItem(accountVisual.toString()),
    },
    clear: async () => {
      await Promise.all([
        keyStorage.removeFolder(`${id}/`),
        EncryptedStorage.remove(xPrivKey),
      ])
    },
  } as const)
}

export type WalletEncryptedStorage = ReturnType<
  typeof makeWalletEncryptedStorage
>
export type EncryptedStorage = typeof EncryptedStorage
