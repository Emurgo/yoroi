/* eslint-disable no-unused-labels */
import AsyncStorage from '@react-native-async-storage/async-storage'
import {parseSafe} from '@yoroi/common'

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
      account: 0,
    })

    const shot = await snapshot()
    await expect(getXPub(meta.id, shot)).resolves.toEqual('$a')
    await expect(getXPriv(meta.id, shot)).resolves.toEqual('$a')
    await expect(getWalletMeta(meta.id, shot)).resolves.toEqual({
      checksum: 'x',
      id: meta.id,
      isEasyConfirmationEnabled: false,
      isHW: false,
      name,
      addressMode,
    })

    await expect(walletManager.hydrate()).resolves.toEqual({
      wallets: expect.any(Array),
      metas: [
        {
          checksum: 'x',
          id: meta.id,
          isEasyConfirmationEnabled: false,
          isHW: false,
          name,
          addressMode,
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
