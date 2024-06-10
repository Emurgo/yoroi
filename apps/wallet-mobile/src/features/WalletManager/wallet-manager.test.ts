/* eslint-disable no-unused-labels */
import AsyncStorage from '@react-native-async-storage/async-storage'
import {parseSafe} from '@yoroi/common'

import {rootStorage} from '../../kernel/storage/rootStorage'
import {isYoroiWallet} from '../../yoroi-wallets/cardano/types'
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
    const networkId = 300
    const walletImplementationId = 'haskell-shelley'
    const addressMode = 'single'

    const wallet = await walletManager.createWalletMnemonic(
      name,
      mnemonic,
      'password',
      networkId,
      walletImplementationId,
      addressMode,
    )
    expect(isYoroiWallet(wallet)).toBe(true)

    const shot = await snapshot()
    const walletMeta = getWalletMeta(wallet.id, shot)
    const walletJSON = getWalletJSON(wallet.id, shot)
    const masterPassword = getMasterPassword(wallet.id, shot)

    expect(walletMeta).toBeTruthy()
    expect(walletJSON).toBeTruthy()
    expect(masterPassword).toBeTruthy()

    await expect(walletManager.hydrate()).resolves.toEqual({
      wallets: expect.any(Array),
      metas: [
        {
          checksum: wallet.checksum,
          id: wallet.id,
          isEasyConfirmationEnabled: false,
          isHW: false,
          name,
          networkId,
          walletImplementationId,
          addressMode,
        },
      ],
    })

    expect(walletManager.walletMetas.size).toBe(1)

    await walletManager.removeWallet(wallet.id)

    await expect(walletManager.walletIdsMarkedForDeletion()).resolves.toEqual([wallet.id])
    await expect(walletManager.hydrate()).resolves.toEqual({wallets: [], metas: []})

    await walletManager.removeWalletsMarkedForDeletion()

    await expect(walletManager.hydrate()).resolves.toEqual({wallets: [], metas: []})
    const finalSnapshot = await snapshot()
    expect(finalSnapshot).not.toHaveProperty(`/wallet/${wallet.id}`)
    expect(finalSnapshot).not.toHaveProperty(`/wallet/${wallet.id}/data`)
    expect(finalSnapshot).not.toHaveProperty(`/keystore/${wallet.id}-MASTER_PASSWORD`)
  })

  it('creates a readonly wallet', async () => {
    const walletManager = new WalletManager({
      rootStorage,
      networkManagers,
    })
    await expect(walletManager.hydrate()).resolves.toEqual({wallets: [], metas: []})

    const name = 'name'
    const accountPubKeyHex =
      '1ba2332dca14d6f1f5a5282512e725852a34d3aee1cc26057e9cfb2c2730f1665934fa0b0fa42e16ded504fa81198e45dc22d10dab69398e730542a198dcbfcf'
    const networkId = 300
    const walletImplementationId = 'haskell-shelley'
    const addressMode = 'single'

    const wallet = await walletManager.createWalletXPub(
      name,
      accountPubKeyHex,
      networkId,
      walletImplementationId,
      null,
      true,
      addressMode,
    )
    expect(isYoroiWallet(wallet)).toBe(true)

    const {metas} = await walletManager.hydrate()
    expect(metas).toHaveLength(1)
    const [walletMeta] = metas
    expect(walletMeta.name).toEqual(name)
    expect(walletMeta.isEasyConfirmationEnabled).toEqual(false)
    expect(walletMeta.networkId).toEqual(networkId)
    expect(walletMeta.walletImplementationId).toEqual(walletImplementationId)
    expect(walletMeta.isHW).toEqual(false)
    expect(walletMeta.addressMode).toEqual(addressMode)
  })

  it('creates a hw wallet', async () => {
    const walletManager = new WalletManager({
      rootStorage,
      networkManagers,
    })
    await expect(walletManager.hydrate()).resolves.toEqual({wallets: [], metas: []})

    const name = 'name'
    const accountPubKeyHex =
      '1ba2332dca14d6f1f5a5282512e725852a34d3aee1cc26057e9cfb2c2730f1665934fa0b0fa42e16ded504fa81198e45dc22d10dab69398e730542a198dcbfcf'
    const networkId = 300
    const walletImplementationId = 'haskell-shelley'
    const hwDeviceInfo = {
      bip44AccountPublic: accountPubKeyHex,
      hwFeatures: {
        deviceId: 'DE:F1:F3:14:AE:93',
        deviceObj: null,
        model: 'Nano',
        serialHex: '3af9018bbe99bb',
        vendor: 'ledger.com',
      },
    }
    const addressMode = 'single'

    const wallet = await walletManager.createWalletXPub(
      name,
      accountPubKeyHex,
      networkId,
      walletImplementationId,
      hwDeviceInfo,
      true,
      addressMode,
    )
    expect(isYoroiWallet(wallet)).toBe(true)

    const {metas} = await walletManager.hydrate()
    expect(metas).toHaveLength(1)
    const [walletMeta] = metas
    expect(walletMeta.name).toEqual(name)
    expect(walletMeta.isEasyConfirmationEnabled).toEqual(false)
    expect(walletMeta.networkId).toEqual(networkId)
    expect(walletMeta.walletImplementationId).toEqual(walletImplementationId)
    expect(walletMeta.isHW).toEqual(true)
    expect(walletMeta.addressMode).toEqual(addressMode)
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
const getWalletJSON = (id: string, snapshot: Record<string, unknown>) => snapshot[`/wallet/${id}/data`]
const getMasterPassword = (id: string, snapshot: Record<string, unknown>) => snapshot[`/keystore/${id}-MASTER_PASSWORD`]
