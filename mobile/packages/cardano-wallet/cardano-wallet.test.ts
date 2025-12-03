import {buildNetworkManagers} from '@yoroi/blockchains'
import {createTokenManagerMock} from '@yoroi/portfolio'
import {App, Chain} from '@yoroi/types'
import {
  getWalletFactory,
  initializeWalletFactories,
} from '@yoroi/wallet-manager'

import AsyncStorage from '@react-native-async-storage/async-storage'

import {keyManager} from './key-manager/key-manager'
import {CardanoMobileWrapped} from './wrappedCsl'

// Setup network managers and initialize wallet factories before tests
const mockTokenManagers = {
  [Chain.Network.Mainnet]: createTokenManagerMock(),
  [Chain.Network.Preprod]: createTokenManagerMock(),
  [Chain.Network.Preview]: createTokenManagerMock(),
}
const mockApiMaker = jest.fn().mockReturnValue({
  getProtocolParams: jest.fn().mockResolvedValue({}),
  getBestBlock: jest.fn().mockResolvedValue({}),
  getUtxoData: jest.fn().mockResolvedValue({}),
})
const networkManagers = buildNetworkManagers({
  tokenManagers: mockTokenManagers,
  apiMaker: mockApiMaker,
})

// Create a mock storage with join method
const createMockStorage = (path = '/'): App.Storage => {
  return {
    join: jest.fn(
      (folderName: string): App.Storage =>
        createMockStorage(`${path}${folderName}`),
    ),
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
    getAllKeys: jest.fn().mockResolvedValue([]),
    multiGet: jest.fn().mockResolvedValue([]),
    multiSet: jest.fn().mockResolvedValue(undefined),
    multiRemove: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
    removeFolder: jest.fn().mockResolvedValue(undefined),
  }
}

const mockCardanoWalletDependencies = {
  rootStorage: createMockStorage(),
  makeWalletEncryptedStorage: jest.fn().mockReturnValue({
    xpriv: {read: jest.fn(), write: jest.fn(), remove: jest.fn()},
    xpub: {read: jest.fn(), write: jest.fn(), remove: jest.fn()},
    clear: jest.fn(),
  }),
  buildPortfolioBalanceManager: jest.fn().mockReturnValue(() => ({
    balanceManager: {
      hydrate: jest.fn(),
      refresh: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      observable$: {subscribe: jest.fn()},
      getPrimaryBalance: jest.fn(),
      getBalances: jest.fn(),
      destroy: jest.fn(),
      clear: jest.fn(),
    },
    balanceStorage: {},
  })),
  toBalanceManagerSyncArgs: jest.fn(),
  makeMemosManager: jest.fn(),
  toLedgerSignRequest: jest.fn(),
  createCollateralEntry: jest.fn(),
}

beforeAll(() => {
  initializeWalletFactories(mockCardanoWalletDependencies, networkManagers)
})

describe('CardanoWallet', () => {
  afterEach(() => AsyncStorage.clear())

  it('build', async () => {
    const ShelleyWalletPreprod = getWalletFactory({
      implementation: 'cardano-cip1852',
      network: Chain.Network.Preprod,
    })
    const mnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon oak'
    const accountVisual = 0
    const id = '261c7e0f-dd72-490c-8ce9-6714b512b969'

    // keys
    const {accountPubKeyHex} = CardanoMobileWrapped.cslScope((csl) =>
      keyManager('cardano-cip1852')({
        csl,
        mnemonic,
        accountVisual,
      }),
    )

    const wallet = await ShelleyWalletPreprod.build({
      id,
      accountPubKeyHex,
      accountVisual,
    })

    expect(wallet.publicKeyHex).toBe(
      '6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665',
    )
    expect(wallet.rewardAddressHex).toBe(
      'e0c11ef08c44f3610b7e56d46e086b90186c12e9a68f0521b7c4c72e4b',
    )
  })
})
