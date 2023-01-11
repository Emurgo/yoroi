import AsyncStorage from '@react-native-async-storage/async-storage'

import {isYoroiWallet} from './cardano'
import walletManager from './walletManager'

describe('walletMananger', () => {
  beforeEach(() => AsyncStorage.clear())

  it('creates a wallet', async () => {
    await expect(walletManager.listWallets()).resolves.toEqual([])

    const name = 'name'
    const mnemonic = [
      'dry balcony arctic what garbage sort',
      'cart shine egg lamp manual bottom',
      'slide assault bus',
    ].join(' ')
    const networkId = 300
    const walletImplementationId = 'haskell-shelley'

    const wallet = await walletManager.createWallet(
      name,
      mnemonic,
      'password',
      networkId,
      walletImplementationId,
      undefined,
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
  })

  it('creates a readonly wallet', async () => {
    await expect(walletManager.listWallets()).resolves.toEqual([])

    const name = 'name'
    const accountPubKeyHex =
      '1ba2332dca14d6f1f5a5282512e725852a34d3aee1cc26057e9cfb2c2730f1665934fa0b0fa42e16ded504fa81198e45dc22d10dab69398e730542a198dcbfcf'
    const networkId = 300
    const walletImplementationId = 'haskell-shelley'

    const wallet = await walletManager.createWalletWithBip44Account(
      name,
      accountPubKeyHex,
      networkId,
      walletImplementationId,
      null,
      true,
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
  })

  it('creates a hw wallet', async () => {
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

    const wallet = await walletManager.createWalletWithBip44Account(
      name,
      accountPubKeyHex,
      networkId,
      walletImplementationId,
      hwDeviceInfo,
      true,
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
  })
})
