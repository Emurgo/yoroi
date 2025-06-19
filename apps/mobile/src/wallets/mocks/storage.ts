import {hex} from '@yoroi/common'
import {WalletEncryptedStorage} from '../../kernel/storage/EncryptedStorage'

export const mockEncryptedStorage: WalletEncryptedStorage = {
  xpriv: {
    read: (password) =>
      password === 'password'
        ? Promise.resolve(hex('ff'))
        : Promise.reject(new Error('Invalid Password')),
    write: () => Promise.resolve(),
    remove: () => Promise.resolve(),
  },
  xpub: {
    read: () => Promise.resolve(''),
    write: () => Promise.resolve(),
    remove: () => Promise.resolve(),
  },
  clear: () => Promise.resolve([undefined, undefined]),
}
