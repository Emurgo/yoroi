import {WalletChecksum} from '@emurgo/cip4-js'
import {App} from '@yoroi/types'

import {AddressMode} from '../../../features/WalletManager/common/types'
import {NetworkId, WalletImplementationId} from '../../../yoroi-wallets/types'
import {isWalletMetaV2, to4_28_0} from './4_28_0'

describe('4_28_0 migrations', () => {
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

  it('should migrate wallet metas', async () => {
    const pwdWalletMeta: WalletMetaV2 = {
      id: '1',
      name: 'Wallet 1',
      networkId: 1,
      isHW: false,
      isEasyConfirmationEnabled: true,
      checksum: {
        TextPart: 'AAA-0001',
        ImagePart:
          'dc0d82f152d90e9cfdecf74935e2222e3e6264654a787fadd4e68503f121dd9fc25030af6be83d7997497ea78b3347f5a9942960de7fdeb2a72b0e0a1e85d344',
      },
      walletImplementationId: 'haskell-shelley',
      addressMode: 'single',
    }

    const hwWalletMeta: WalletMetaV2 = {
      id: '2',
      name: 'Wallet 2',
      networkId: 0,
      isHW: true,
      isEasyConfirmationEnabled: false,
      checksum: {
        TextPart: 'AAA-0002',
        ImagePart:
          'dc0d82f152d90e9cfdecf74935e2222e3e6264654a787fadd4e68503f121dd9fc25030af6be83d7997497ea78b3347f5a9942960de7fdeb2a72b0e0a1e85d344',
      },
      walletImplementationId: 'haskell-shelley-24',
      addressMode: 'multiple',
    }

    const bioAuthWalletMeta: WalletMetaV2 = {
      id: '3',
      name: 'Wallet 3',
      networkId: 300,
      isHW: false,
      isEasyConfirmationEnabled: true,
      checksum: {
        TextPart: 'AAA-0003',
        ImagePart:
          'dc0d82f152d90e9cfdecf74935e2222e3e6264654a787fadd4e68503f121dd9fc25030af6be83d7997497ea78b3347f5a9942960de7fdeb2a72b0e0a1e85d344',
      },
      walletImplementationId: 'haskell-byron',
      addressMode: 'single',
    }

    const walletMetas = [pwdWalletMeta, hwWalletMeta, bioAuthWalletMeta]

    jest.spyOn(storage, 'getAllKeys').mockResolvedValue(walletMetas.map((meta) => meta.id))
    jest.spyOn(storage, 'multiGet').mockResolvedValue(walletMetas.map((meta) => [meta.id, meta]))
    jest.spyOn(storage, 'setItem')

    await to4_28_0(storage)

    expect(storage.multiGet).toHaveBeenCalledWith(['1', '2', '3'])
    expect(storage.setItem).toHaveBeenCalledTimes(3)
    expect(storage.setItem).toHaveBeenNthCalledWith(1, '1', {
      id: '1',
      name: 'Wallet 1',
      addressMode: 'single',
      implementation: 'cardano-shelley',
      isHW: false,
      isEasyConfirmationEnabled: true,
      version: 3,
      plate: 'AAA-0001',
      avatar: expect.any(String),
    })

    expect(storage.setItem).toHaveBeenNthCalledWith(2, '2', {
      id: '2',
      name: 'Wallet 2',
      addressMode: 'multiple',
      implementation: 'cardano-shelley',
      isHW: true,
      isEasyConfirmationEnabled: false,
      version: 3,
      plate: 'AAA-0002',
      avatar: expect.any(String),
    })

    expect(storage.setItem).toHaveBeenNthCalledWith(3, '3', {
      id: '3',
      name: 'Wallet 3',
      addressMode: 'single',
      implementation: 'cardano-byron',
      isHW: false,
      isEasyConfirmationEnabled: true,
      version: 3,
      plate: 'AAA-0003',
      avatar: expect.any(String),
    })
  })

  it('should correctly identify meta v2', () => {
    const walletMeta = {
      id: '1',
      name: 'Wallet 1',
      networkId: 1,
      isHW: false,
      isEasyConfirmationEnabled: true,
      checksum: {
        TextPart: 'AAA-0001',
        ImagePart:
          'dc0d82f152d90e9cfdecf74935e2222e3e6264654a787fadd4e68503f121dd9fc25030af6be83d7997497ea78b3347f5a9942960de7fdeb2a72b0e0a1e85d344',
      },
      walletImplementationId: 'haskell-shelley',
      addressMode: 'single',
    }

    expect(isWalletMetaV2(walletMeta)).toBe(true)
  })

  it('should correctly identify non meta v2', () => {
    const walletMeta = {
      version: 3,
      id: '1',
      name: 'Wallet 1',
      networkId: 1,
      isHW: false,
      isEasyConfirmationEnabled: true,
      checksum: {
        TextPart: 'AAA-0001',
        ImagePart:
          'dc0d82f152d90e9cfdecf74935e2222e3e6264654a787fadd4e68503f121dd9fc25030af6be83d7997497ea78b3347f5a9942960de7fdeb2a72b0e0a1e85d344',
      },
      walletImplementationId: 'haskell-shelley',
      addressMode: 'single',
    }

    expect(isWalletMetaV2(walletMeta)).toBe(false)
  })
})

// copied over so we don't export this type
type WalletMetaV2 = {
  id: string
  name: string
  isHW: boolean
  isEasyConfirmationEnabled: boolean
  addressMode: AddressMode
  walletImplementationId: WalletImplementationId
  checksum: WalletChecksum

  networkId: NetworkId
}
