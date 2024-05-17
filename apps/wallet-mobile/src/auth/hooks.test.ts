import AsyncStorage from '@react-native-async-storage/async-storage'
import {parseSafe} from '@yoroi/common'

import {WalletMeta} from '../features/WalletManager/common/types'
import {disableAllEasyConfirmation, enableAuthWithOs} from '../yoroi-wallets/auth'
import {rootStorage} from '../yoroi-wallets/storage/rootStorage'

describe('enableAuthWithOs', () => {
  beforeEach(() => AsyncStorage.clear())

  it('empty', async () => {
    await enableAuthWithOs(rootStorage)
    expect(await storageSnapshot()).toEqual({
      '/appSettings/auth': 'os',
    })
  })

  it('existing value', async () => {
    rootStorage.join('appSettings/').setItem('auth', 'pin')

    await enableAuthWithOs(rootStorage)
    expect(await storageSnapshot()).toEqual({
      '/appSettings/auth': 'os',
    })
  })

  it('remove pin', async () => {
    rootStorage.join('appSettings/').setItem('auth', 'pin')
    rootStorage.join('appSettings/').setItem('customPinHash', '123456789')

    await enableAuthWithOs(rootStorage)
    expect(await storageSnapshot()).toEqual({
      '/appSettings/auth': 'os',
    })
  })
})

describe('disableAllEasyConfirmations', () => {
  beforeEach(() => AsyncStorage.clear())

  it('works', async () => {
    await rootStorage.join('wallet/').setItem('1', {
      ...mockWalletMeta,
      isEasyConfirmationEnabled: true,
    } as WalletMeta)
    await rootStorage
      .join('wallet/')
      .join('1/')
      .setItem('data', {...mockWalletJSON, isEasyConfirmationEnabled: true})

    await rootStorage.join('wallet/').setItem('2', {
      ...mockWalletMeta,
      isEasyConfirmationEnabled: true,
    } as WalletMeta)
    await rootStorage
      .join('wallet/')
      .join('2/')
      .setItem('data', {...mockWalletJSON, isEasyConfirmationEnabled: true})

    await disableAllEasyConfirmation(rootStorage)
    expect(await storageSnapshot()).toEqual({
      '/wallet/1': {
        checksum: {
          ImagePart:
            'b04dc22991594170974bbbb5908cc50b48f236d680a9ebfe6c1d00f52f8f4813341943eb66dec48cfe7f3be5beec705b91300a07641e668ff19dfa2fbeccbfba',
          TextPart: 'JHKT-8080',
        },

        id: 'wallet-id',
        isEasyConfirmationEnabled: false,
        isHW: false,
        name: 'my-wallet',
        networkId: 1,
        walletImplementationId: 'haskell-shelley-24',
        addressMode: 'multiple',
      },

      '/wallet/1/data': {
        isEasyConfirmationEnabled: false,
      },

      '/wallet/2': {
        checksum: {
          ImagePart:
            'b04dc22991594170974bbbb5908cc50b48f236d680a9ebfe6c1d00f52f8f4813341943eb66dec48cfe7f3be5beec705b91300a07641e668ff19dfa2fbeccbfba',
          TextPart: 'JHKT-8080',
        },

        id: 'wallet-id',
        isEasyConfirmationEnabled: false,
        isHW: false,
        name: 'my-wallet',
        networkId: 1,
        walletImplementationId: 'haskell-shelley-24',
        addressMode: 'multiple',
      },

      '/wallet/2/data': {
        isEasyConfirmationEnabled: false,
      },
    })
  })
})

const storageSnapshot = async () => {
  const keys = await AsyncStorage.getAllKeys()
  const entries = await AsyncStorage.multiGet(keys).then((entries) =>
    entries.map(([key, value]) => [key, parseSafe(value)]),
  )

  return Object.fromEntries(entries)
}

const mockWalletMeta: WalletMeta = {
  id: 'wallet-id',
  name: 'my-wallet',
  networkId: 1,
  isHW: false,
  isEasyConfirmationEnabled: true,
  checksum: {
    TextPart: 'JHKT-8080',
    ImagePart:
      'b04dc22991594170974bbbb5908cc50b48f236d680a9ebfe6c1d00f52f8f4813341943eb66dec48cfe7f3be5beec705b91300a07641e668ff19dfa2fbeccbfba',
  },
  walletImplementationId: 'haskell-shelley-24',
  addressMode: 'multiple',
}

const mockWalletJSON = {isEasyConfirmationEnabled: true}
