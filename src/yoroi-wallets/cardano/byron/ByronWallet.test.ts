/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage'

import {EncryptedStorage, EncryptedStorageKeys} from '../../../auth'
import {HWDeviceInfo} from '../../hw'
import {storage} from '../../storage'
import {WalletMeta} from '../../walletManager'
import {ShelleyAddressGeneratorJSON} from '../chain'
import {YoroiWallet} from '../types'
import {ByronWallet, WalletJSON} from './ByronWallet'

describe('ByronWallet', () => {
  afterEach(() => AsyncStorage.clear())

  it('create', async () => {
    const mnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon oak'
    const password = 'password'

    const wallet: YoroiWallet & Record<string, any> = await ByronWallet.create({
      id: walletMeta.id,
      mnemonic,
      storage: storage.join(`${walletMeta.id}/`),
      password,
    })

    expect(wallet.id).toBe(walletMeta.id)
    expect(wallet.networkId).toBe(1)
    expect(wallet.isEasyConfirmationEnabled).toBe(false)
    expect(wallet.isHW).toBe(false)
    expect(wallet.hwDeviceInfo).toBe(null)
    expect(wallet.checksum?.TextPart).toBe('OSEC-2869')
    expect(wallet.checksum?.ImagePart).toBe(
      '4252069ffbf52c5bbae1dd6a8e1801dd27cc279a88602292287146b21c5668edc8393502b27b21ca9954062ecde30beea06caf775a3580dd23017cfe19a2c2db',
    )
    expect(wallet.rewardAddressHex).toBe('e1c11ef08c44f3610b7e56d46e086b90186c12e9a68f0521b7c4c72e4b')
    expect(wallet.publicKeyHex).toBe(
      '6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665',
    )
    expect(wallet.utxos).toEqual([])
    expect(wallet.internalAddresses).toMatchSnapshot()
    expect(wallet.externalAddresses).toMatchSnapshot()
    expect(wallet.transactions).toEqual({})
    expect(wallet.state).toEqual({
      lastGeneratedAddressIndex: 0,
    })

    expect(wallet.internalChain?._addressGenerator.toJSON().type).toBe('Internal')
    expect(wallet.internalChain?._addressGenerator.toJSON().walletImplementationId).toBe('haskell-byron')
    expect((wallet.internalChain?._addressGenerator.toJSON() as ShelleyAddressGeneratorJSON).accountPubKeyHex).toBe(
      '6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665',
    )

    expect(wallet.externalChain?._addressGenerator.toJSON().type).toBe('External')
    expect(wallet.externalChain?._addressGenerator.toJSON().walletImplementationId).toBe('haskell-byron')
    expect((wallet.externalChain?._addressGenerator.toJSON() as ShelleyAddressGeneratorJSON).accountPubKeyHex).toBe(
      '6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665',
    )

    // Decrypted Root Key / Change Password
    expect(wallet.getDecryptedRootKey('wrong password')).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Decryption error"`,
    )
    await expect(wallet.getDecryptedRootKey(password)).resolves.toBe(
      'a0cf109fd1346748a20f2ade2b3d1e1561485d2f28ae6d8c36e289b4d0ca22544b4e892132ca15095d48370d4cb2bc7c8cde3f68b8a2f63cfeda4c5ac2752599065111b0929f2b3e6fa0f4bddbc90f9a00d1997d4164f6361d2c0f3c4be1f050',
    )

    expect(wallet.changePassword('wrong password', 'new password')).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Decryption error"`,
    )
    const newPassword = 'new-password'
    await wallet.changePassword(password, newPassword)

    expect(wallet.getDecryptedRootKey(password)).rejects.toThrowErrorMatchingInlineSnapshot(`"Decryption error"`)
    await expect(wallet.getDecryptedRootKey(newPassword)).resolves.toBe(
      'a0cf109fd1346748a20f2ade2b3d1e1561485d2f28ae6d8c36e289b4d0ca22544b4e892132ca15095d48370d4cb2bc7c8cde3f68b8a2f63cfeda4c5ac2752599065111b0929f2b3e6fa0f4bddbc90f9a00d1997d4164f6361d2c0f3c4be1f050',
    )

    expect(wallet.getChangeAddress()).toBe('Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp')

    expect(wallet.primaryToken).toEqual({
      identifier: '',
      isDefault: true,
      metadata: {
        assetName: '',
        longName: null,
        maxSupply: '45000000000000000',
        numberOfDecimals: 6,
        policyId: '',
        ticker: 'ADA',
        type: 'Cardano',
      },
      networkId: 1,
    })
    expect(wallet.primaryTokenInfo).toEqual({
      decimals: 6,
      description: 'Cardano',
      id: '',
      name: 'ADA',
      symbol: '₳',
      ticker: 'ADA',
      group: '',
      fingerprint: '',
      logo: '',
      url: '',
    })
    await expect(getStakingKey(wallet)).resolves.toBe(
      "ed25519_pk158gpk02jqrsxa58aw2e4f0ww6fffu7p2qsflenapdz7a3r5lxx4sn9nx84"
    )

    await expect(getWalletData(wallet)).resolves.toMatchSnapshot()
  })

  it('restore', async () => {
    storage.setItem(`${walletMeta.id}`, walletMeta)
    storage.setItem(`${walletMeta.id}/data`, data)

    const rootKey =
      'a0cf109fd1346748a20f2ade2b3d1e1561485d2f28ae6d8c36e289b4d0ca22544b4e892132ca15095d48370d4cb2bc7c8cde3f68b8a2f63cfeda4c5ac2752599065111b0929f2b3e6fa0f4bddbc90f9a00d1997d4164f6361d2c0f3c4be1f050'
    const password = 'password'
    await EncryptedStorage.write(EncryptedStorageKeys.rootKey(walletMeta.id), rootKey, password)

    const wallet: YoroiWallet & Record<string, any> = await ByronWallet.restore({
      storage: storage.join(`${walletMeta.id}/`),
      walletMeta,
    })
    await wallet.internalChain?._addressGenerator.getRewardAddressHex()

    expect(wallet.id).toBe(walletMeta.id)
    expect(wallet.networkId).toBe(1)
    expect(wallet.isEasyConfirmationEnabled).toBe(false)
    expect(wallet.isHW).toBe(false)
    expect(wallet.hwDeviceInfo).toBe(null)
    expect(wallet.checksum?.TextPart).toBe('OSEC-2869')
    expect(wallet.checksum?.ImagePart).toBe(
      '4252069ffbf52c5bbae1dd6a8e1801dd27cc279a88602292287146b21c5668edc8393502b27b21ca9954062ecde30beea06caf775a3580dd23017cfe19a2c2db',
    )
    expect(wallet.rewardAddressHex).toBe('e1c11ef08c44f3610b7e56d46e086b90186c12e9a68f0521b7c4c72e4b')
    expect(wallet.publicKeyHex).toBe(
      '6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665',
    )
    expect(wallet.utxos).toEqual([])
    expect(wallet.internalAddresses).toMatchSnapshot()
    expect(wallet.externalAddresses).toMatchSnapshot()
    expect(wallet.transactions).toEqual({})
    expect(wallet.state).toEqual({
      lastGeneratedAddressIndex: 13,
    })

    expect(wallet.internalChain?._addressGenerator.toJSON().type).toBe('Internal')
    expect(wallet.internalChain?._addressGenerator.toJSON().walletImplementationId).toBe('haskell-byron')
    expect((wallet.internalChain?._addressGenerator.toJSON() as ShelleyAddressGeneratorJSON).accountPubKeyHex).toBe(
      '6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665',
    )

    expect(wallet.externalChain?._addressGenerator.toJSON().type).toBe('External')
    expect(wallet.externalChain?._addressGenerator.toJSON().walletImplementationId).toBe('haskell-byron')
    expect((wallet.externalChain?._addressGenerator.toJSON() as ShelleyAddressGeneratorJSON).accountPubKeyHex).toBe(
      '6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665',
    )

    // Decrypted Root Key / Change Password
    expect(wallet.getDecryptedRootKey('wrong password')).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Decryption error"`,
    )
    await expect(wallet.getDecryptedRootKey(password)).resolves.toBe(
      'a0cf109fd1346748a20f2ade2b3d1e1561485d2f28ae6d8c36e289b4d0ca22544b4e892132ca15095d48370d4cb2bc7c8cde3f68b8a2f63cfeda4c5ac2752599065111b0929f2b3e6fa0f4bddbc90f9a00d1997d4164f6361d2c0f3c4be1f050',
    )

    expect(wallet.changePassword('wrong password', 'new password')).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Decryption error"`,
    )
    const newPassword = 'new-password'
    await wallet.changePassword(password, newPassword)

    expect(wallet.getDecryptedRootKey(password)).rejects.toThrowErrorMatchingInlineSnapshot(`"Decryption error"`)
    await expect(wallet.getDecryptedRootKey(newPassword)).resolves.toBe(
      'a0cf109fd1346748a20f2ade2b3d1e1561485d2f28ae6d8c36e289b4d0ca22544b4e892132ca15095d48370d4cb2bc7c8cde3f68b8a2f63cfeda4c5ac2752599065111b0929f2b3e6fa0f4bddbc90f9a00d1997d4164f6361d2c0f3c4be1f050',
    )

    expect(wallet.getChangeAddress()).toBe('Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp')

    expect(wallet.primaryToken).toEqual({
      identifier: '',
      isDefault: true,
      metadata: {
        assetName: '',
        longName: null,
        maxSupply: '45000000000000000',
        numberOfDecimals: 6,
        policyId: '',
        ticker: 'ADA',
        type: 'Cardano',
      },
      networkId: 1,
    })
    expect(wallet.primaryTokenInfo).toEqual({
      decimals: 6,
      description: 'Cardano',
      id: '',
      name: 'ADA',
      symbol: '₳',
      ticker: 'ADA',
      group: '',
      fingerprint: '',
      logo: '',
      url: '',
    })
    await expect(getStakingKey(wallet)).resolves.toBe(
      "ed25519_pk158gpk02jqrsxa58aw2e4f0ww6fffu7p2qsflenapdz7a3r5lxx4sn9nx84"
    )

    await expect(getWalletData(wallet)).resolves.toMatchSnapshot()
  })

  it('create hw ', async () => {
    const accountPubKeyHex =
      '1ba2332dca14d6f1f5a5282512e725852a34d3aee1cc26057e9cfb2c2730f1665934fa0b0fa42e16ded504fa81198e45dc22d10dab69398e730542a198dcbfcf'
    const hwDeviceInfo: HWDeviceInfo = {
      bip44AccountPublic: accountPubKeyHex,
      hwFeatures: {
        deviceId: 'DE:F1:F3:14:AE:93',
        deviceObj: null,
        model: 'Nano',
        serialHex: '3af9018bbe99bb',
        vendor: 'ledger.com',
      },
    }
    const isReadOnly = false

    const wallet: YoroiWallet & Record<string, any> = await ByronWallet.createBip44({
      id: walletMeta.id,
      accountPubKeyHex,
      storage: storage.join(`${walletMeta.id}/`),
      hwDeviceInfo,
      isReadOnly,
    })

    expect(wallet.id).toBe(walletMeta.id)
    expect(wallet.networkId).toBe(1)
    expect(wallet.isEasyConfirmationEnabled).toBe(false)
    expect(wallet.isHW).toBe(true)
    expect(wallet.hwDeviceInfo).toEqual(hwDeviceInfo)
    expect(wallet.checksum?.TextPart).toBe('SHCZ-0679')
    expect(wallet.checksum?.ImagePart).toBe(
      'bc210d41df754ddf71057ea8186e7ec61f6effa28e5ea6a205684673da32eea2c3f4115ddd1fe9cbcbf7482cea56b16bd1244614d6e868ff433a92e01b92bcae',
    )
    expect(wallet.publicKeyHex).toBe(
      '1ba2332dca14d6f1f5a5282512e725852a34d3aee1cc26057e9cfb2c2730f1665934fa0b0fa42e16ded504fa81198e45dc22d10dab69398e730542a198dcbfcf',
    )
    expect(wallet.utxos).toEqual([])
    expect(wallet.internalAddresses).toMatchSnapshot()
    expect(wallet.externalAddresses).toMatchSnapshot()
    expect(wallet.transactions).toEqual({})
    expect(wallet.state).toEqual({
      lastGeneratedAddressIndex: 0,
    })

    expect(wallet.internalChain?._addressGenerator.toJSON().type).toBe('Internal')
    expect(wallet.internalChain?._addressGenerator.toJSON().walletImplementationId).toBe('haskell-byron')
    expect((wallet.internalChain?._addressGenerator.toJSON() as ShelleyAddressGeneratorJSON).accountPubKeyHex).toBe(
      '1ba2332dca14d6f1f5a5282512e725852a34d3aee1cc26057e9cfb2c2730f1665934fa0b0fa42e16ded504fa81198e45dc22d10dab69398e730542a198dcbfcf',
    )

    expect(wallet.externalChain?._addressGenerator.toJSON().type).toBe('External')
    expect(wallet.externalChain?._addressGenerator.toJSON().walletImplementationId).toBe('haskell-byron')
    expect((wallet.externalChain?._addressGenerator.toJSON() as ShelleyAddressGeneratorJSON).accountPubKeyHex).toBe(
      '1ba2332dca14d6f1f5a5282512e725852a34d3aee1cc26057e9cfb2c2730f1665934fa0b0fa42e16ded504fa81198e45dc22d10dab69398e730542a198dcbfcf',
    )

    expect(wallet.getChangeAddress()).toBe('Ae2tdPwUPEZ5MPt1BeMo4fpuo9Kef4VZ4XmjXu9D8NLx3bno2XZiTCnGf4a')

    expect(wallet.primaryToken).toEqual({
      identifier: '',
      isDefault: true,
      metadata: {
        assetName: '',
        longName: null,
        maxSupply: '45000000000000000',
        numberOfDecimals: 6,
        policyId: '',
        ticker: 'ADA',
        type: 'Cardano',
      },
      networkId: 1,
    })
    expect(wallet.primaryTokenInfo).toEqual({
      decimals: 6,
      description: 'Cardano',
      id: '',
      name: 'ADA',
      symbol: '₳',
      ticker: 'ADA',
      group: '',
      fingerprint: '',
      url: '',
      logo: '',
    })
    await expect(getStakingKey(wallet)).resolves.toBe(
      'ed25519_pk1su9gfd9nkxw0uchht47cluxus3lqlf50mruvvuv2pqpph9qgmhzq08a7zq',
    )

    await expect(getWalletData(wallet)).resolves.toMatchSnapshot()
  })
})

const walletMeta: WalletMeta = {
  id: '261c7e0f-dd72-490c-8ce9-6714b512b969',
  name: 'My Wallet',
  networkId: 0,
  walletImplementationId: 'haskell-byron',
  isHW: false,
  checksum: {
    ImagePart:
      '4252069ffbf52c5bbae1dd6a8e1801dd27cc279a88602292287146b21c5668edc8393502b27b21ca9954062ecde30beea06caf775a3580dd23017cfe19a2c2db',
    TextPart: 'OSEC-2869',
  },
  isEasyConfirmationEnabled: false,
}

const data: WalletJSON = {
  lastGeneratedAddressIndex: 13,
  publicKeyHex:
    '6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665',
  version: '1.5.1',
  internalChain: {
    gapLimit: 20,
    blockSize: 50,
    addresses: [
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
    ],
    addressGenerator: {
      accountPubKeyHex:
        '6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665',
      walletImplementationId: 'haskell-byron',
      type: 'Internal',
    },
  },
  externalChain: {
    gapLimit: 20,
    blockSize: 50,
    addresses: [
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
      'Ae2tdPwUPEZ8DYsokmK3RD4gS6we8jJayWfi5sP3VzL9NVk7KPo57WC34Mp',
    ],
    addressGenerator: {
      accountPubKeyHex:
        '6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665',
      walletImplementationId: 'haskell-byron',
      type: 'External',
    },
  },
  isHW: false,
  hwDeviceInfo: null,
  isReadOnly: false,
  isEasyConfirmationEnabled: false,
}

const getWalletData = async (wallet: YoroiWallet) => storage.join(`${wallet.id}/`).getItem(`data`)
const getStakingKey = (wallet: any) => wallet.getStakingKey().then((key) => key.toBech32())
