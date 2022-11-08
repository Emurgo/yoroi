import {YoroiWallet} from '../yoroi-wallets'
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

export const Keychain = {
  authenticate,
  getWalletKey,
  setWalletKey,
  removeWalletKey,
}
