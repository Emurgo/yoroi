import {hex, parseSafe} from '@yoroi/common'

import AsyncStorage from '@react-native-async-storage/async-storage'

import {decryptData} from '~/kernel/crypto/decrypt-data'
import {rootStorage} from '~/kernel/storage/storages'

import {networkManagers} from './common/constants'
import {makeWalletManager} from './wallet-manager'

// Mock the global networkManagers before any wallet factory code imports it
// This prevents real network calls when wallets are created/loaded
jest.mock('./common/constants', () => {
  const actual = jest.requireActual('./common/constants')
  const {buildNetworkManagers} = jest.requireActual('@yoroi/blockchains')
  const {tokenManagers} = jest
    .requireActual('../Portfolio/common/helpers/build-token-managers')
    .buildPortfolioTokenManagers()
  const mockApiMaker = jest.fn().mockReturnValue({
    getProtocolParams: jest.fn().mockResolvedValue({}),
    getBestBlock: jest.fn().mockResolvedValue({}),
    getUtxoData: jest.fn().mockResolvedValue({}),
  })
  const networkManagers = buildNetworkManagers({
    tokenManagers,
    logger: actual.logger,
    apiMaker: mockApiMaker,
  })
  return {
    ...actual,
    networkManagers,
  }
})

describe('walletManager', () => {
  beforeEach(() => {
    AsyncStorage.clear()
  })

  it('creates a wallet', async () => {
    const walletManager = makeWalletManager({
      rootStorage,
      networkManagers,
      cardanoWalletDependencies: {
        rootStorage,
        makeWalletEncryptedStorage: jest.fn().mockReturnValue({
          xpriv: {
            read: jest.fn(),
            write: jest.fn(),
            remove: jest.fn(),
          },
          xpub: {
            read: jest.fn(),
            write: jest.fn(),
            remove: jest.fn(),
          },
          clear: jest.fn(),
        }),
        buildPortfolioBalanceManager: jest.fn(),
        toBalanceManagerSyncArgs: jest.fn(),
        makeMemosManager: jest.fn(),
        toLedgerSignRequest: jest.fn(),
        createCollateralEntry: jest.fn(),
      },
    })
    await expect(walletManager.hydrate()).resolves.toEqual({
      wallets: [],
      metas: [],
    })

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
