import {hex} from '@yoroi/common'

import type {WalletEncryptedStorage} from '../../dependencies'

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
  multisigSharedKey: {
    read: () => Promise.resolve(null),
    write: () => Promise.resolve(),
    remove: () => Promise.resolve(),
  },
  clear: () => Promise.resolve(),
}
