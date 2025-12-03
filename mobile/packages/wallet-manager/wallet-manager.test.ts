import {hex, parseSafe} from '@yoroi/common'

import AsyncStorage from '@react-native-async-storage/async-storage'

import {decryptData} from '~/kernel/crypto/decrypt-data'
import {rootStorage} from '~/kernel/storage/storages'

import {makeWalletManager} from './wallet-manager'

// Mock networkManagers for testing
// This prevents real network calls when wallets are created/loaded
jest.mock('./common/constants', () => {
  const actual = jest.requireActual('./common/constants')
  const blockchains = jest.requireActual('@yoroi/blockchains')
  const {buildNetworkManagers} =
    blockchains as typeof import('@yoroi/blockchains')
  const portfolio = jest.requireActual('@yoroi/portfolio')
  const {createTokenManagerMock} =
    portfolio as typeof import('@yoroi/portfolio')
  const types = jest.requireActual('@yoroi/types')
  const {Chain} = types as typeof import('@yoroi/types')
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
  const mockNetworkManagers = buildNetworkManagers({
    tokenManagers: mockTokenManagers,
    apiMaker: mockApiMaker,
  })
  return {
    ...actual,
    networkManagers: mockNetworkManagers,
  }
})

describe('walletManager', () => {
  beforeEach(async () => {
    // Clear all storage before each test
    await AsyncStorage.clear()
    // Ensure walletsRootStorage is also empty
    const walletsRootStorage = rootStorage.join('wallet/')
    const walletKeys = await walletsRootStorage.getAllKeys()
    if (walletKeys.length > 0) {
      await walletsRootStorage.multiRemove(walletKeys)
    }
  })

  it('creates a wallet', async () => {
    const {networkManagers} = require('./common/constants')
    // Create a factory function that returns storage per wallet ID
    // Track written values so they can be read back
    const storageMap = new Map<string, Map<string | number, string>>()
    const makeWalletEncryptedStorage = jest.fn((id: string) => {
      if (!storageMap.has(id)) {
        storageMap.set(id, new Map())
      }
      const walletStorage = storageMap.get(id)!
      return {
        xpriv: {
          read: jest.fn().mockImplementation(async (_password: string) => {
            const value = walletStorage.get('xpriv')
            return value ? {value} : null
          }),
          write: jest.fn().mockImplementation(async (value: string) => {
            walletStorage.set('xpriv', value)
          }),
          remove: jest.fn().mockImplementation(async () => {
            walletStorage.delete('xpriv')
          }),
        },
        xpub: {
          read: jest.fn().mockImplementation(async (accountVisual: number) => {
            const value = walletStorage.get(`xpub-${accountVisual}`)
            return value ? {value} : null
          }),
          write: jest
            .fn()
            .mockImplementation(
              async (accountVisual: number, value: string) => {
                walletStorage.set(`xpub-${accountVisual}`, value)
              },
            ),
          remove: jest
            .fn()
            .mockImplementation(async (accountVisual: number) => {
              walletStorage.delete(`xpub-${accountVisual}`)
            }),
        },
        clear: jest.fn().mockImplementation(async () => {
          walletStorage.clear()
        }),
      }
    })
    const walletManager = makeWalletManager({
      rootStorage,
      networkManagers,
      cardanoWalletDependencies: {
        rootStorage,
        makeWalletEncryptedStorage,
        buildPortfolioBalanceManager: jest.fn(),
        toBalanceManagerSyncArgs: jest.fn(),
        makeMemosManager: jest.fn(),
        toLedgerSignRequest: jest.fn(),
        createCollateralEntry: jest.fn(),
      },
    })
    // First hydrate should return empty arrays - if there are wallet metas without xpub,
    // loadWalletsSafely should catch the error and skip them
    const firstHydrate = await walletManager.hydrate()
    expect(firstHydrate.wallets).toEqual([])
    expect(firstHydrate.metas).toEqual([])

    const name = 'name'
    const mnemonic = [
      'dry balcony arctic what garbage sort',
      'cart shine egg lamp manual bottom',
      'slide assault bus',
    ].join(' ')
    const implementation = 'cardano-cip1852'
    const addressMode = 'single'

    const meta = await walletManager.createWalletMnemonic({
      name,
      mnemonic,
      password: 'password',
      implementation,
      addressMode,
      accountVisual: 0,
    })

    const shot = await snapshot()
    expect(getXPub(meta.id, shot).value).toEqual(
      '7cc9d816f272eb78a2db936a839d3bf53fa960dd470ddbaadabb6a7bf2019b837d20b2cd13cbb22b6f6938abea40d425f5539b6bb1fe0813ccb4c21676a7fd6b',
    )
    const decriptedData = await decryptData({
      encryptedData: getXPriv(meta.id, shot),
      secretKey: hex.fromUtf8('password'),
    })
    expect(decriptedData.value).toEqual(
      '9053adfb225e91c0bf2db38e1978907cfeff6e66b9a9c3d8945aa686a9d29851bf83c8e2e556464605afeb9651fab3ef3f0aa205685c8f1e6f818629f843bde9a7e129fd35d072ce79b40a49cefcbc8526a3cb8d4bfa7a47afddaddc31dbb728',
    )
    expect(getWalletMeta(meta.id, shot)).toEqual({
      id: meta.id,
      isEasyConfirmationEnabled: false,
      isHW: false,
      name,
      addressMode,
      isReadOnly: false,
      plate: 'NNPB-3784',
      version: 3,
      implementation: 'cardano-cip1852',
      hwDeviceInfo: null,
      avatar: expect.any(String),
    })

    await expect(walletManager.hydrate()).resolves.toEqual({
      wallets: expect.any(Array),
      metas: [
        {
          id: meta.id,
          isEasyConfirmationEnabled: false,
          isHW: false,
          name,
          addressMode,
          isReadOnly: false,
          plate: 'NNPB-3784',
          version: 3,
          implementation: 'cardano-cip1852',
          hwDeviceInfo: null,
          avatar: expect.any(String),
        },
      ],
    })

    expect(walletManager.walletMetas.size).toBe(1)

    await walletManager.removeWallet(meta.id)

    // removeWallet deletes immediately, so walletIdsMarkedForDeletion should be empty
    await expect(walletManager.walletIdsMarkedForDeletion()).resolves.toEqual(
      [],
    )
    await expect(walletManager.hydrate()).resolves.toEqual({
      wallets: [],
      metas: [],
    })

    await walletManager.removeWalletsMarkedForDeletion()

    await expect(walletManager.hydrate()).resolves.toEqual({
      wallets: [],
      metas: [],
    })
    const finalSnapshot = await snapshot()
    expect(finalSnapshot).not.toHaveProperty(`/wallet/${meta.id}`)
    expect(finalSnapshot).not.toHaveProperty(
      `/keystore/${meta.id}-MASTER_PASSWORD`,
    )
    expect(finalSnapshot).not.toHaveProperty(`/keystore/${meta.id}/0`)
  })
})

const snapshot = async () => {
  const keys = await AsyncStorage.getAllKeys()
  const entries = await AsyncStorage.multiGet(keys).then((entries) =>
    entries.map(([key, value]) => [key, parseSafe(value)]),
  )

  return Object.fromEntries(entries)
}

const getWalletMeta = (id: string, snapshot: Record<string, unknown>) =>
  snapshot[`/wallet/${id}`]
const getXPriv = (id: string, snapshot: Record<string, unknown>) =>
  hex(String(snapshot[`/keystore/${id}-MASTER_PASSWORD`] ?? ''))
const getXPub = (id: string, snapshot: Record<string, unknown>) =>
  hex(String(snapshot[`/keystore/${id}/0`] ?? ''))
