import {CardanoApi} from '@yoroi/api'
import {buildNetworkManagers} from '@yoroi/blockchains'
import {getMasterKeyFromMnemonic} from '@yoroi/cardano-wallet'
import {createTokenManagerMock} from '@yoroi/portfolio'
import {Chain, Wallet} from '@yoroi/types'

import {initializeWalletFactories} from '../network-manager/get-wallet-factory'
import {
  createWalletFromMnemonic,
  createWalletFromRootKey,
  createWalletFromXPub,
} from './wallet-creation'

describe('wallet-creation', () => {
  // Setup network managers and initialize wallet factories
  const mockTokenManagers = {
    [Chain.Network.Mainnet]: createTokenManagerMock(),
    [Chain.Network.Preprod]: createTokenManagerMock(),
    [Chain.Network.Preview]: createTokenManagerMock(),
  }
  const networkManagers = buildNetworkManagers({
    tokenManagers: mockTokenManagers,
    apiMaker: CardanoApi.cardanoApiMaker,
  })

  const mockCardanoWalletDependencies = {
    rootStorage: {} as any,
    makeWalletEncryptedStorage: jest.fn(),
    buildPortfolioBalanceManager: jest.fn(),
    toBalanceManagerSyncArgs: jest.fn(),
    makeMemosManager: jest.fn(),
    toLedgerSignRequest: jest.fn(),
    createCollateralEntry: jest.fn(),
  }

  beforeAll(() => {
    initializeWalletFactories(mockCardanoWalletDependencies, networkManagers)
  })

  const mockOptions = {
    name: 'Test Wallet',
    implementation: 'cardano-cip1852' as Wallet.Implementation,
    addressMode: 'multiple' as Wallet.AddressMode,
    accountVisual: 0,
    network: Chain.Network.Mainnet as Chain.SupportedNetworks,
    version: 3,
    walletsRootStorage: {
      setItem: jest.fn().mockResolvedValue(undefined),
      join: jest.fn().mockReturnThis(),
    } as any,
    keychainManager: undefined,
    networkManagers,
  }

  const testMnemonic =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

  const mockMakeWalletEncryptedStorage = jest.fn().mockReturnValue({
    xpriv: {
      read: jest.fn().mockResolvedValue({value: 'mock-root-key'}),
      write: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
    },
    xpub: {
      read: jest.fn().mockResolvedValue(null),
      write: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
    },
    clear: jest.fn().mockResolvedValue(undefined),
  })

  describe('createWalletFromMnemonic', () => {
    it('should create wallet meta from mnemonic', async () => {
      const meta = await createWalletFromMnemonic(
        {
          ...mockOptions,
          mnemonic: testMnemonic,
          password: 'test-password',
        },
        mockMakeWalletEncryptedStorage,
      )

      expect(meta).toBeDefined()
      expect(meta.id).toBeDefined()
      expect(meta.name).toBe(mockOptions.name)
      expect(meta.implementation).toBe(mockOptions.implementation)
      expect(meta.isReadOnly).toBe(false)
    })
  })

  describe('createWalletFromXPub', () => {
    it('should create wallet meta from xpub', async () => {
      const accountPubKeyHex =
        '8e4e2f11b6ac2a269913286e26339779ab8767579d18d173cdd324929d94e2c43e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247'

      const meta = await createWalletFromXPub(
        {
          ...mockOptions,
          accountPubKeyHex,
          hwDeviceInfo: null,
          isReadOnly: false,
        },
        mockMakeWalletEncryptedStorage,
      )

      expect(meta).toBeDefined()
      expect(meta.id).toBeDefined()
      expect(meta.name).toBe(mockOptions.name)
      expect(meta.isReadOnly).toBe(false)
    })

    it('should create read-only wallet from xpub', async () => {
      const accountPubKeyHex =
        '8e4e2f11b6ac2a269913286e26339779ab8767579d18d173cdd324929d94e2c43e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247'

      const meta = await createWalletFromXPub(
        {
          ...mockOptions,
          accountPubKeyHex,
          hwDeviceInfo: null,
          isReadOnly: true,
        },
        mockMakeWalletEncryptedStorage,
      )

      expect(meta.isReadOnly).toBe(true)
    })
  })

  describe('createWalletFromRootKey', () => {
    it('should create wallet meta from root key', async () => {
      // Generate a valid BIP32 root key from the test mnemonic
      // getMasterKeyFromMnemonic returns the bytes of a BIP32PrivateKey (96 bytes = 192 hex chars)
      const rootKeyBytes = getMasterKeyFromMnemonic(testMnemonic)
      const rootKeyHex = Buffer.from(rootKeyBytes).toString('hex')

      const meta = await createWalletFromRootKey(
        {
          ...mockOptions,
          rootKeyHex,
          password: 'test-password',
        },
        mockMakeWalletEncryptedStorage,
      )

      expect(meta).toBeDefined()
      expect(meta.id).toBeDefined()
      expect(meta.name).toBe(mockOptions.name)
      expect(meta.isReadOnly).toBe(false)
    })
  })
})
