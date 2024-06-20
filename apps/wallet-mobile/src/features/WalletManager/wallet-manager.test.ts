/* eslint-disable no-unused-labels */
import AsyncStorage from '@react-native-async-storage/async-storage'
import {parseSafe} from '@yoroi/common'

import {decryptData} from '../../kernel/encryption/encryption'
import {rootStorage} from '../../kernel/storage/rootStorage'
import {buildPortfolioTokenManagers} from '../Portfolio/common/helpers/build-token-managers'
import {buildNetworkManagers} from './network-manager/network-manager'
import {WalletManager} from './wallet-manager'

describe('walletManager', () => {
  // TODO: should be mocked
  const {tokenManagers} = buildPortfolioTokenManagers()
  const networkManagers = buildNetworkManagers({tokenManagers})

  beforeEach(() => {
    AsyncStorage.clear()
  })

  it('creates a wallet', async () => {
    const walletManager = new WalletManager({
      rootStorage,
      networkManagers,
    })
    await expect(walletManager.hydrate()).resolves.toEqual({wallets: [], metas: []})

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
    expect(getXPub(meta.id, shot)).toEqual(
      '7cc9d816f272eb78a2db936a839d3bf53fa960dd470ddbaadabb6a7bf2019b837d20b2cd13cbb22b6f6938abea40d425f5539b6bb1fe0813ccb4c21676a7fd6b',
    )
    const decriptedData = await decryptData(getXPriv(meta.id, shot) as string, 'password')
    expect(decriptedData).toEqual(
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

    await expect(walletManager.walletIdsMarkedForDeletion()).resolves.toEqual([meta.id])
    await expect(walletManager.hydrate()).resolves.toEqual({wallets: [], metas: []})

    await walletManager.removeWalletsMarkedForDeletion()

    await expect(walletManager.hydrate()).resolves.toEqual({wallets: [], metas: []})
    const finalSnapshot = await snapshot()
    expect(finalSnapshot).not.toHaveProperty(`/wallet/${meta.id}`)
    expect(finalSnapshot).not.toHaveProperty(`/keystore/${meta.id}-MASTER_PASSWORD`)
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

const getWalletMeta = (id: string, snapshot: Record<string, unknown>) => snapshot[`/wallet/${id}`]
const getXPriv = (id: string, snapshot: Record<string, unknown>) => snapshot[`/keystore/${id}-MASTER_PASSWORD`]
const getXPub = (id: string, snapshot: Record<string, unknown>) => snapshot[`/keystore/${id}/0`]
