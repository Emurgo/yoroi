import AsyncStorage from '@react-native-async-storage/async-storage'
import {Chain} from '@yoroi/types'

import {getWalletFactory} from '../../features/WalletManager/network-manager/helpers/get-wallet-factory'
import {keyManager} from './key-manager/key-manager'
import {YoroiWallet} from './types'
import {wrappedCsl} from './wrappedCsl'

describe('CardanoWallet', () => {
  afterEach(() => AsyncStorage.clear())

  const ShelleyWalletPreprod = getWalletFactory({
    implementation: 'cardano-cip1852',
    network: Chain.Network.Preprod,
  })

  it('create (should have data after syncing)', async () => {
    const mnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon oak'
    const accountVisual = 0
    const id = '261c7e0f-dd72-490c-8ce9-6714b512b969'

    // keys
    const {csl, release} = wrappedCsl()
    const {accountPubKeyHex} = await keyManager('cardano-cip1852')({mnemonic, csl, accountVisual})
    release()

    const wallet: YoroiWallet = await ShelleyWalletPreprod.build({
      id,
      accountPubKeyHex,
      accountVisual,
    })

    await wallet.sync({isForced: false})

    expect(wallet.internalAddresses).toMatchSnapshot()
    expect(wallet.externalAddresses).toMatchSnapshot()

    expect(wallet.rewardAddressHex).toBe('e0c11ef08c44f3610b7e56d46e086b90186c12e9a68f0521b7c4c72e4b')
  })

  it('build (should load)', async () => {
    const mnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon oak'
    const accountVisual = 0
    const id = '261c7e0f-dd72-490c-8ce9-6714b512b969'

    // keys
    const {csl, release} = wrappedCsl()
    const {accountPubKeyHex} = await keyManager('cardano-cip1852')({mnemonic, csl, accountVisual})
    release()

    const wallet: YoroiWallet = await ShelleyWalletPreprod.build({
      id,
      accountPubKeyHex,
      accountVisual,
    })

    expect(wallet.internalAddresses).toMatchSnapshot()
    expect(wallet.externalAddresses).toMatchSnapshot()

    expect(wallet.rewardAddressHex).toBe('e0c11ef08c44f3610b7e56d46e086b90186c12e9a68f0521b7c4c72e4b')
  })
})
