import {EncryptedStorage} from '../../src/auth'
import storage from '../../src/legacy/storage'

export const mockEncryptedStorage: EncryptedStorage = {
  read: async (_key, password) => {
    if (password !== 'password') throw new Error('Invalid Password')

    return 'rootKey'
  },
  write: async () => undefined,
  remove: async () => true,
}

export const mockStorage: typeof storage = {
  ...storage,
}
