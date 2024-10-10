import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {AuthenticationPrompt, KeychainStorage} from './KeychainStorage'

const authenticate = async (authenticationPrompt: AuthenticationPrompt) => {
  await KeychainStorage.write('os-auth', '-') // value is irrelevant
  await KeychainStorage.read('os-auth', authenticationPrompt)
}

const getWalletKey = (id: YoroiWallet['id'], authenticationPrompt: AuthenticationPrompt) =>
  KeychainStorage.read(id, authenticationPrompt)

const setWalletKey = async (id: YoroiWallet['id'], rootKey: string) => {
  await KeychainStorage.write(id, rootKey)
}

const removeWalletKey = async (id: YoroiWallet['id']) => {
  await KeychainStorage.remove(id)
}

export const Keychain: KeychainManager = {
  authenticate,
  getWalletKey,
  setWalletKey,
  removeWalletKey,
  Errors: KeychainStorage.Errors,
} as const

export type KeychainManager = {
  authenticate: (authenticationPrompt: AuthenticationPrompt) => Promise<void>
  getWalletKey: (id: YoroiWallet['id'], authenticationPrompt: AuthenticationPrompt) => Promise<string>
  setWalletKey: (id: YoroiWallet['id'], rootKey: string) => Promise<void>
  removeWalletKey: (id: YoroiWallet['id']) => Promise<void>
  Errors: typeof KeychainStorage.Errors
}
