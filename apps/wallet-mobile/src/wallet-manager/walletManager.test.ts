/* eslint-disable no-unused-labels */
import AsyncStorage from '@react-native-async-storage/async-storage'
import {parseSafe} from '@yoroi/common'

import {isYoroiWallet} from '../yoroi-wallets/cardano/types'
import {WalletManager} from './walletManager'

// ! Actually hitting the API
describe('walletMananger', () => {
  beforeEach(() => AsyncStorage.clear())

  it('creates a wallet', async () => {
    const walletManager = new WalletManager()
    await expect(walletManager.listWallets()).resolves.toEqual([])

    const name = 'name'
    const mnemonic = [
      'dry balcony arctic what garbage sort',
      'cart shine egg lamp manual bottom',
      'slide assault bus',
    ].join(' ')
    const networkId = 300
    const walletImplementationId = 'haskell-shelley'
    const addressMode = 'single'

    const wallet = await walletManager.createWallet(
      name,
      mnemonic,
      'password',
      networkId,
      walletImplementationId,
      addressMode,
    )
    expect(isYoroiWallet(wallet)).toBe(true)

    before: {
      const shot = await snapshot()
      const walletMeta = getWalletMeta(wallet.id, shot)
      const walletJSON = getWalletJSON(wallet.id, shot)
      const masterPassword = getMasterPassword(wallet.id, shot)

      expect(walletMeta).toBeTruthy()
      expect(walletJSON).toBeTruthy()
      expect(masterPassword).toBeTruthy()

      expect(await walletManager.listWallets()).toEqual([
        {
          checksum: {
            ImagePart:
              '33166efaf23401b284eadb3b7d353d6c0d666369e8424d88ec1d00c6188777412412232d9b5f64353c03eac83bec4be0dba9877bce27d7bd7e00788bbdc3e61f',
            TextPart: 'NNPB-3784',
          },
          id: wallet.id,
          isEasyConfirmationEnabled: false,
          isHW: false,
          name: 'name',
          networkId: 300,
          walletImplementationId: 'haskell-shelley',
          addressMode: 'single',
        },
      ])
    }

    await walletManager.removeWallet(wallet.id)

    expect(await walletManager.deletedWalletIds()).toEqual([wallet.id])
    expect(await walletManager.listWallets()).toEqual([])

    after: {
      const walletManager = new WalletManager()
      expect(await walletManager.listWallets()).toEqual([])

      await walletManager.removeDeletedWallets()

      const shot = await snapshot()
      const walletMeta = getWalletMeta(wallet.id, shot)
      const walletJSON = getWalletJSON(wallet.id, shot)
      const masterPassword = getMasterPassword(wallet.id, shot)

      expect(await walletManager.listWallets()).toEqual([])
      expect(walletMeta).toBeFalsy()
      expect(walletJSON).toBeFalsy()
      expect(masterPassword).toBeFalsy()
    }
  })

  it('creates a readonly wallet', async () => {
    const walletManager = new WalletManager()
    await expect(walletManager.listWallets()).resolves.toEqual([])

    const name = 'name'
    const accountPubKeyHex =
      '1ba2332dca14d6f1f5a5282512e725852a34d3aee1cc26057e9cfb2c2730f1665934fa0b0fa42e16ded504fa81198e45dc22d10dab69398e730542a198dcbfcf'
    const networkId = 300
    const walletImplementationId = 'haskell-shelley'
    const addressMode = 'single'

    const wallet = await walletManager.createWalletWithBip44Account(
      name,
      accountPubKeyHex,
      networkId,
      walletImplementationId,
      null,
      true,
      addressMode,
    )
    expect(isYoroiWallet(wallet)).toBe(true)

    const walletMetas = await walletManager.listWallets()
    expect(walletMetas).toHaveLength(1)
    const [walletMeta] = walletMetas
    expect(walletMeta.name).toEqual(name)
    expect(walletMeta.isEasyConfirmationEnabled).toEqual(false)
    expect(walletMeta.networkId).toEqual(networkId)
    expect(walletMeta.walletImplementationId).toEqual(walletImplementationId)
    expect(walletMeta.isHW).toEqual(false)
    expect(walletMeta.addressMode).toEqual(addressMode)
  })

  it('creates a hw wallet', async () => {
    const walletManager = new WalletManager()
    await expect(walletManager.listWallets()).resolves.toEqual([])

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

    const wallet = await walletManager.createWalletWithBip44Account(
      name,
      accountPubKeyHex,
      networkId,
      walletImplementationId,
      hwDeviceInfo,
      true,
      addressMode,
    )
    expect(isYoroiWallet(wallet)).toBe(true)

    const walletMetas = await walletManager.listWallets()
    expect(walletMetas).toHaveLength(1)
    const [walletMeta] = walletMetas
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
