import {WalletEncryptedStorage} from '../../src/auth'

export const mockEncryptedStorage: WalletEncryptedStorage = {
  rootKey: {
    read: (password) => (password === 'password' ? Promise.resolve('') : Promise.reject(new Error('Invalid Password'))),
    write: () => Promise.resolve(),
    remove: () => Promise.resolve(),
  },
}
