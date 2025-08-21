import {AuthenticationPrompt, KeychainStorage} from './KeychainStorage'

const authenticate = async (authenticationPrompt: AuthenticationPrompt) => {
  await KeychainStorage.write('os-auth', '-') // value is irrelevant
  await KeychainStorage.read('os-auth', authenticationPrompt)
}

const getWalletKey = (id: string, authenticationPrompt: AuthenticationPrompt) =>
  KeychainStorage.read(id, authenticationPrompt)

const setWalletKey = async (id: string, rootKey: string) => {
  await KeychainStorage.write(id, rootKey)
}

const removeWalletKey = async (id: string) => {
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
  getWalletKey: (
    id: string,
    authenticationPrompt: AuthenticationPrompt,
  ) => Promise<string>
  setWalletKey: (id: string, rootKey: string) => Promise<void>
  removeWalletKey: (id: string) => Promise<void>
  Errors: typeof KeychainStorage.Errors
}
