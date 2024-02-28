import {App} from '@yoroi/types'

import {isWalletMetaV1, migrateAddressMode} from './4_26_0'

describe('4_26_0 migrations', () => {
  let storage: App.Storage

  beforeEach(() => {
    storage = {
      join: jest.fn().mockReturnThis(),
      removeItem: jest.fn(),
      getAllKeys: jest.fn(),
      multiGet: jest.fn(),
      setItem: jest.fn(),
    } as never
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should migrate address mode for wallet metas', async () => {
    const walletMeta1 = {
      id: '1',
      name: 'Wallet 1',
      networkId: 1,
      isHW: false,
      isEasyConfirmationEnabled: true,
      checksum: {},
      walletImplementationId: 'haskell-shelley',
    }

    const walletMeta2 = {
      id: '2',
      name: 'Wallet 2',
      networkId: 2,
      isHW: true,
      isEasyConfirmationEnabled: false,
      checksum: {},
      walletImplementationId: 'haskell-shelley',
    }

    const walletMeta3 = {
      id: '3',
      name: 'Wallet 3',
      networkId: 3,
      isHW: false,
      isEasyConfirmationEnabled: true,
      checksum: {},
      walletImplementationId: 'haskell-shelley',
    }

    const walletMetas = [walletMeta1, walletMeta2, walletMeta3]

    jest.spyOn(storage, 'getAllKeys').mockResolvedValue(walletMetas.map((meta) => meta.id))
    jest.spyOn(storage, 'multiGet').mockResolvedValue(walletMetas.map((meta) => [meta.id, meta]))
    jest.spyOn(storage, 'setItem')
    jest.spyOn(storage, 'removeItem')

    await migrateAddressMode(storage)

    expect(storage.multiGet).toHaveBeenCalledWith(['1', '2', '3'])
    expect(storage.removeItem).toHaveBeenCalledWith('deletedWalletIds')
    expect(storage.setItem).toHaveBeenCalledTimes(3)
    expect(storage.setItem).toHaveBeenCalledWith('1', {
      ...walletMeta1,
      addressMode: 'multiple',
    })
    expect(storage.setItem).toHaveBeenCalledWith('2', {
      ...walletMeta2,
      addressMode: 'multiple',
    })
    expect(storage.setItem).toHaveBeenCalledWith('3', {
      ...walletMeta3,
      addressMode: 'multiple',
    })
  })

  it('should correctly identify wallet meta v1', () => {
    const walletMeta = {
      id: '1',
      name: 'Wallet 1',
      networkId: 1,
      isHW: false,
      isEasyConfirmationEnabled: true,
      checksum: {},
      walletImplementationId: 'haskell-shelley',
    }

    expect(isWalletMetaV1(walletMeta)).toBe(true)
  })

  it('should correctly identify non-wallet meta v1', () => {
    const walletMeta = {
      id: '1',
      name: 'Wallet 1',
      networkId: 1,
      isHW: false,
      isEasyConfirmationEnabled: true,
      checksum: {},
      walletImplementationId: 'haskell-shelley',
      addressMode: 'single',
    }

    expect(isWalletMetaV1(walletMeta)).toBe(false)
  })
})
