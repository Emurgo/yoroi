import {WalletEncryptedStorage} from '../../src/auth'
import storage from '../../src/legacy/storage'

export const mockEncryptedStorage: WalletEncryptedStorage = {
  rootKey: {
    read: (password) => password === 'pasword' ? Promise.resolve('') : Promise.reject(new Error('Invalid Password')),
    write: () => Promise.resolve(),
    remove: () => Promise.resolve(true),
  },
}

export const mockStorage: typeof storage = {
  ...storage,
}
