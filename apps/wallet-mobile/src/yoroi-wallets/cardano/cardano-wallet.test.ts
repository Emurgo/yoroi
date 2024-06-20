import AsyncStorage from '@react-native-async-storage/async-storage'
import {Chain} from '@yoroi/types'

import {getWalletFactory} from '../../features/WalletManager/network-manager/helpers/get-wallet-factory'
import {keyManager} from './key-manager/key-manager'
import {wrappedCsl} from './wrappedCsl'

describe('CardanoWallet', () => {
  afterEach(() => AsyncStorage.clear())

  const ShelleyWalletPreprod = getWalletFactory({
    implementation: 'cardano-cip1852',
    network: Chain.Network.Preprod,
  })

  it('build', async () => {
    const mnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon oak'
    const accountVisual = 0
    const id = '261c7e0f-dd72-490c-8ce9-6714b512b969'

    // keys
    const {csl, release} = wrappedCsl()
    const {accountPubKeyHex} = await keyManager('cardano-cip1852')({mnemonic, csl, accountVisual})
    release()

    const wallet = await ShelleyWalletPreprod.build({
      id,
      accountPubKeyHex,
      accountVisual,
    })

    expect(wallet.publicKeyHex).toBe(
      '6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665',
    )
    expect(wallet.rewardAddressHex).toBe('e0c11ef08c44f3610b7e56d46e086b90186c12e9a68f0521b7c4c72e4b')
  })
})
