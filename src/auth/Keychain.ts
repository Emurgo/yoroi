import {YoroiWallet} from '../yoroi-wallets'
import {AuthenticationPrompt, KeychainStorage} from './KeychainStorage'

const authenticate = async (authenticationPrompt: AuthenticationPrompt) => {
  await KeychainStorage.read(KEYCHAIN_APP_AUTH_KEY, authenticationPrompt)
}
const initialize = async () => {
  await KeychainStorage.write(KEYCHAIN_APP_AUTH_KEY, '-') // value is irrelevant
}

const getWalletKey = (id: YoroiWallet['id'], authenticationPrompt: AuthenticationPrompt) =>
  KeychainStorage.read(id, authenticationPrompt)
const setWalletKey = async (id: YoroiWallet['id'], rootKey: string) => {
  await KeychainStorage.write(id, rootKey)
}
const removeWalletKey = async (id: YoroiWallet['id']) => {
  await KeychainStorage.remove(id)
}

export const Keychain = {
  authenticate,
  initialize,
  getWalletKey,
  setWalletKey,
  removeWalletKey,
}

const KEYCHAIN_APP_AUTH_KEY = 'os-authentication'
