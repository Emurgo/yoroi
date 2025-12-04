import {CardanoApi} from '@yoroi/api'
import {buildNetworkManagers} from '@yoroi/blockchains'
import {createTokenManagerMock} from '@yoroi/portfolio'
import {Chain, Network, Wallet} from '@yoroi/types'

import {getWalletFactory, initializeWalletFactories} from './get-wallet-factory'

describe('getWalletFactory', () => {
  // Mock dependencies
  const mockCardanoWalletDependencies = {
    rootStorage: {} as any,
    makeWalletEncryptedStorage: jest.fn().mockReturnValue({
      xpriv: {read: jest.fn(), write: jest.fn(), remove: jest.fn()},
      xpub: {read: jest.fn(), write: jest.fn(), remove: jest.fn()},
      clear: jest.fn(),
    }),
    buildPortfolioBalanceManager: jest.fn(),
    toBalanceManagerSyncArgs: jest.fn(),
    makeMemosManager: jest.fn(),
    toLedgerSignRequest: jest.fn(),
    createCollateralEntry: jest.fn(),
  }

  let networkManagers: Readonly<
    Record<Chain.SupportedNetworks, Network.Manager>
  >

  beforeAll(() => {
    // Build network managers for testing with mocked token managers
    const mockTokenManagers = {
      [Chain.Network.Mainnet]: createTokenManagerMock(),
      [Chain.Network.Preprod]: createTokenManagerMock(),
      [Chain.Network.Preview]: createTokenManagerMock(),
    }
    networkManagers = buildNetworkManagers({
      tokenManagers: mockTokenManagers,
      apiMaker: CardanoApi.cardanoApiMaker,
    })

    // Initialize wallet factories
    initializeWalletFactories(mockCardanoWalletDependencies, networkManagers)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return the correct wallet factory for Mainnet', () => {
    const network = Chain.Network.Mainnet
    const implementation: Wallet.Implementation = 'cardano-cip1852'

    const result = getWalletFactory({network, implementation})

    expect(result).toBeDefined()
  })

  it('should return the correct wallet factory for Preprod', () => {
    const network = Chain.Network.Preprod
    const implementation: Wallet.Implementation = 'cardano-cip1852'

    const result = getWalletFactory({network, implementation})

    expect(result).toBeDefined()
  })

  it('should return the correct wallet factory for Mainnet with implementation "haskell-byron"', () => {
    const network = Chain.Network.Mainnet
    const implementation: Wallet.Implementation = 'cardano-bip44'

    const result = getWalletFactory({network, implementation})

    expect(result).toBeDefined()
  })

  it('should throw for unknown network', () => {
    const network = 'unknown-network' as Chain.SupportedNetworks
    const implementation: Wallet.Implementation = 'cardano-cip1852'

    expect(() => getWalletFactory({network, implementation})).toThrow(
      'getWalletFactory: Unable to find network implementations',
    )
  })

  it('should throw for unknown implementation', () => {
    const network = Chain.Network.Mainnet
    const implementation = 'unknown-implementation' as Wallet.Implementation

    expect(() => getWalletFactory({network, implementation})).toThrow(
      'getWalletFactory: Unable to find wallet factory',
    )
  })
})
