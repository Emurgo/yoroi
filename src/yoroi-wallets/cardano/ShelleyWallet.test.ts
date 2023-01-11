import AsyncStorage from '@react-native-async-storage/async-storage'

import {EncryptedStorage, EncryptedStorageKeys} from '../../auth'
import {HWDeviceInfo} from '../../legacy/ledgerUtils'
import {WalletMeta} from '../../legacy/state'
import {storage} from '../storage'
import {ShelleyAddressGeneratorJSON} from './chain'
import {ShelleyWallet, WalletJSON} from './ShelleyWallet'
import {YoroiWallet} from './types'

describe('migration', () => {
  afterEach(() => AsyncStorage.clear())

  it('create', async () => {
    const mnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon oak'
    const password = 'password'

    const wallet: YoroiWallet & Record<string, any> = await ShelleyWallet.create({
      id: walletMeta.id,
      mnemonic,
      networkId: walletMeta.networkId,
      implementationId: walletMeta.walletImplementationId,
      storage: storage.join(`${walletMeta.id}/`),
      password,
      provider: undefined,
    })

    expect(wallet.id).toMatchInlineSnapshot(`"261c7e0f-dd72-490c-8ce9-6714b512b969"`)
    expect(wallet.networkId).toMatchInlineSnapshot(`1`)
    expect(wallet.isEasyConfirmationEnabled).toMatchInlineSnapshot(`false`)
    expect(wallet.isHW).toMatchInlineSnapshot(`false`)
    expect(wallet.hwDeviceInfo).toMatchInlineSnapshot(`null`)
    expect(wallet.provider).toMatchInlineSnapshot(`undefined`)
    expect(wallet.checksum?.TextPart).toMatchInlineSnapshot(`"OSEC-2869"`)
    expect(wallet.checksum?.ImagePart).toMatchInlineSnapshot(
      `"4252069ffbf52c5bbae1dd6a8e1801dd27cc279a88602292287146b21c5668edc8393502b27b21ca9954062ecde30beea06caf775a3580dd23017cfe19a2c2db"`,
    )
    expect(wallet.rewardAddressHex).toMatchInlineSnapshot(
      `"e1c11ef08c44f3610b7e56d46e086b90186c12e9a68f0521b7c4c72e4b"`,
    )
    expect(wallet.publicKeyHex).toMatchInlineSnapshot(
      `"6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665"`,
    )
    expect(wallet.utxos).toMatchInlineSnapshot(`Array []`)
    expect(wallet.internalAddresses).toMatchSnapshot()
    expect(wallet.externalAddresses).toMatchSnapshot()
    expect(wallet.transactions).toMatchInlineSnapshot(`Object {}`)
    expect(wallet.state).toMatchInlineSnapshot(`
          Object {
            "lastGeneratedAddressIndex": 0,
          }
          `)

    await expect(getBech32InternalChain(wallet)).resolves.toMatchInlineSnapshot(
      `"xpub1ds33reh84y6828z4q4xtyx4cgnew2ka2fr7g72vd64zrpugk68q5chcj69tpzecy2ns9a7k8f6846h5g0t3vzhhnpphqdywsmppevegxuvdnj"`,
    )
    expect(wallet.internalChain?._addressGenerator.toJSON().type).toMatchInlineSnapshot(`"Internal"`)
    expect(wallet.internalChain?._addressGenerator.toJSON().walletImplementationId).toMatchInlineSnapshot(
      `"haskell-shelley"`,
    )
    expect(
      (wallet.internalChain?._addressGenerator.toJSON() as ShelleyAddressGeneratorJSON).accountPubKeyHex,
    ).toMatchInlineSnapshot(
      `"6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665"`,
    )

    expect(wallet.externalChain?._addressGenerator.toJSON().type).toMatchInlineSnapshot(`"External"`)
    expect(wallet.externalChain?._addressGenerator.toJSON().walletImplementationId).toMatchInlineSnapshot(
      `"haskell-shelley"`,
    )
    expect(
      (wallet.externalChain?._addressGenerator.toJSON() as ShelleyAddressGeneratorJSON).accountPubKeyHex,
    ).toMatchInlineSnapshot(
      `"6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665"`,
    )

    // Decrypted Root Key / Change Password
    expect(wallet.getDecryptedRootKey('wrong password')).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Decryption error"`,
    )
    await expect(wallet.getDecryptedRootKey(password)).resolves.toMatchInlineSnapshot(
      `"a0cf109fd1346748a20f2ade2b3d1e1561485d2f28ae6d8c36e289b4d0ca22544b4e892132ca15095d48370d4cb2bc7c8cde3f68b8a2f63cfeda4c5ac2752599065111b0929f2b3e6fa0f4bddbc90f9a00d1997d4164f6361d2c0f3c4be1f050"`,
    )

    expect(wallet.changePassword('wrong password', 'new password')).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Decryption error"`,
    )
    const newPassword = 'new-password'
    await wallet.changePassword(password, newPassword)

    expect(wallet.getDecryptedRootKey(password)).rejects.toThrowErrorMatchingInlineSnapshot(`"Decryption error"`)
    await expect(wallet.getDecryptedRootKey(newPassword)).resolves.toMatchInlineSnapshot(
      `"a0cf109fd1346748a20f2ade2b3d1e1561485d2f28ae6d8c36e289b4d0ca22544b4e892132ca15095d48370d4cb2bc7c8cde3f68b8a2f63cfeda4c5ac2752599065111b0929f2b3e6fa0f4bddbc90f9a00d1997d4164f6361d2c0f3c4be1f050"`,
    )

    expect(wallet.getChangeAddress()).toMatchInlineSnapshot(
      `"addr1q90qj49u70m8xa9v0f6d2frtvv33v5x4gwckvxllv6regw7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sv69ppj"`,
    )

    await expect(getRewardAddress(wallet)).resolves.toMatchInlineSnapshot(
      `"stake1u8q3auyvgnekzzm72m2xuzrtjqvxcyhf568s2gdhcnrjujcr25kkv"`,
    )

    expect(wallet.transactionCache?.perRewardAddressCertificates).toMatchInlineSnapshot(`Object {}`)
    expect(wallet.transactionCache?.confirmationCounts).toMatchInlineSnapshot(`Object {}`)
    expect(wallet.transactionCache?.perAddressTxs).toMatchInlineSnapshot(`Object {}`)
    expect(wallet.transactionCache?.transactions).toMatchInlineSnapshot(`Object {}`)

    expect(wallet.primaryToken).toMatchInlineSnapshot(`
      Object {
        "identifier": "",
        "isDefault": true,
        "metadata": Object {
          "assetName": "",
          "longName": null,
          "maxSupply": "45000000000000000",
          "numberOfDecimals": 6,
          "policyId": "",
          "ticker": "ADA",
          "type": "Cardano",
        },
        "networkId": 1,
      }
    `)
    await expect(getStakingKey(wallet)).resolves.toMatchInlineSnapshot(
      `"ed25519_pk158gpk02jqrsxa58aw2e4f0ww6fffu7p2qsflenapdz7a3r5lxx4sn9nx84"`,
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

    const wallet: YoroiWallet & Record<string, any> = await ShelleyWallet.restore({
      storage: storage.join(`${walletMeta.id}/`),
      walletMeta,
    })
    await wallet.internalChain?._addressGenerator.getRewardAddressHex()

    expect(wallet.id).toMatchInlineSnapshot(`"261c7e0f-dd72-490c-8ce9-6714b512b969"`)
    expect(wallet.networkId).toMatchInlineSnapshot(`1`)
    expect(wallet.isEasyConfirmationEnabled).toMatchInlineSnapshot(`false`)
    expect(wallet.isHW).toMatchInlineSnapshot(`false`)
    expect(wallet.hwDeviceInfo).toMatchInlineSnapshot(`null`)
    expect(wallet.provider).toMatchInlineSnapshot(`""`)
    expect(wallet.checksum?.TextPart).toMatchInlineSnapshot(`"OSEC-2869"`)
    expect(wallet.checksum?.ImagePart).toMatchInlineSnapshot(
      `"4252069ffbf52c5bbae1dd6a8e1801dd27cc279a88602292287146b21c5668edc8393502b27b21ca9954062ecde30beea06caf775a3580dd23017cfe19a2c2db"`,
    )
    expect(wallet.rewardAddressHex).toMatchInlineSnapshot(
      `"e1c11ef08c44f3610b7e56d46e086b90186c12e9a68f0521b7c4c72e4b"`,
    )
    expect(wallet.publicKeyHex).toMatchInlineSnapshot(
      `"6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665"`,
    )
    expect(wallet.utxos).toMatchInlineSnapshot(`Array []`)
    expect(wallet.internalAddresses).toMatchSnapshot()
    expect(wallet.externalAddresses).toMatchSnapshot()
    expect(wallet.transactions).toMatchInlineSnapshot(`Object {}`)
    expect(wallet.state).toMatchInlineSnapshot(`
      Object {
        "lastGeneratedAddressIndex": 13,
      }
    `)

    await expect(getBech32InternalChain(wallet)).resolves.toMatchInlineSnapshot(
      `"xpub1ds33reh84y6828z4q4xtyx4cgnew2ka2fr7g72vd64zrpugk68q5chcj69tpzecy2ns9a7k8f6846h5g0t3vzhhnpphqdywsmppevegxuvdnj"`,
    )
    expect(wallet.internalChain?._addressGenerator.toJSON().type).toMatchInlineSnapshot(`"Internal"`)
    expect(wallet.internalChain?._addressGenerator.toJSON().walletImplementationId).toMatchInlineSnapshot(
      `"haskell-shelley"`,
    )
    expect(
      (wallet.internalChain?._addressGenerator.toJSON() as ShelleyAddressGeneratorJSON).accountPubKeyHex,
    ).toMatchInlineSnapshot(
      `"6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665"`,
    )

    expect(wallet.externalChain?._addressGenerator.toJSON().type).toMatchInlineSnapshot(`"External"`)
    expect(wallet.externalChain?._addressGenerator.toJSON().walletImplementationId).toMatchInlineSnapshot(
      `"haskell-shelley"`,
    )
    expect(
      (wallet.externalChain?._addressGenerator.toJSON() as ShelleyAddressGeneratorJSON).accountPubKeyHex,
    ).toMatchInlineSnapshot(
      `"6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665"`,
    )

    // Decrypted Root Key / Change Password
    expect(wallet.getDecryptedRootKey('wrong password')).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Decryption error"`,
    )
    await expect(wallet.getDecryptedRootKey(password)).resolves.toMatchInlineSnapshot(
      `"a0cf109fd1346748a20f2ade2b3d1e1561485d2f28ae6d8c36e289b4d0ca22544b4e892132ca15095d48370d4cb2bc7c8cde3f68b8a2f63cfeda4c5ac2752599065111b0929f2b3e6fa0f4bddbc90f9a00d1997d4164f6361d2c0f3c4be1f050"`,
    )

    expect(wallet.changePassword('wrong password', 'new password')).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Decryption error"`,
    )
    const newPassword = 'new-password'
    await wallet.changePassword(password, newPassword)

    expect(wallet.getDecryptedRootKey(password)).rejects.toThrowErrorMatchingInlineSnapshot(`"Decryption error"`)
    await expect(wallet.getDecryptedRootKey(newPassword)).resolves.toMatchInlineSnapshot(
      `"a0cf109fd1346748a20f2ade2b3d1e1561485d2f28ae6d8c36e289b4d0ca22544b4e892132ca15095d48370d4cb2bc7c8cde3f68b8a2f63cfeda4c5ac2752599065111b0929f2b3e6fa0f4bddbc90f9a00d1997d4164f6361d2c0f3c4be1f050"`,
    )

    expect(wallet.getChangeAddress()).toMatchInlineSnapshot(
      `"addr1q90qj49u70m8xa9v0f6d2frtvv33v5x4gwckvxllv6regw7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sv69ppj"`,
    )

    await expect(getRewardAddress(wallet)).resolves.toMatchInlineSnapshot(
      `"stake1u8q3auyvgnekzzm72m2xuzrtjqvxcyhf568s2gdhcnrjujcr25kkv"`,
    )

    expect(wallet.transactionCache?.perRewardAddressCertificates).toMatchInlineSnapshot(`Object {}`)
    expect(wallet.transactionCache?.confirmationCounts).toMatchInlineSnapshot(`Object {}`)
    expect(wallet.transactionCache?.perAddressTxs).toMatchInlineSnapshot(`Object {}`)
    expect(wallet.transactionCache?.transactions).toMatchInlineSnapshot(`Object {}`)

    expect(wallet.primaryToken).toMatchInlineSnapshot(`
      Object {
        "identifier": "",
        "isDefault": true,
        "metadata": Object {
          "assetName": "",
          "longName": null,
          "maxSupply": "45000000000000000",
          "numberOfDecimals": 6,
          "policyId": "",
          "ticker": "ADA",
          "type": "Cardano",
        },
        "networkId": 1,
      }
    `)
    await expect(getStakingKey(wallet)).resolves.toMatchInlineSnapshot(
      `"ed25519_pk158gpk02jqrsxa58aw2e4f0ww6fffu7p2qsflenapdz7a3r5lxx4sn9nx84"`,
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

    const wallet: YoroiWallet & Record<string, any> = await ShelleyWallet.createBip44({
      id: walletMeta.id,
      accountPubKeyHex,
      networkId: walletMeta.networkId,
      implementationId: walletMeta.walletImplementationId,
      storage: storage.join(`${walletMeta.id}/`),
      hwDeviceInfo,
      isReadOnly,
    })

    expect(wallet.id).toMatchInlineSnapshot(`"261c7e0f-dd72-490c-8ce9-6714b512b969"`)
    expect(wallet.networkId).toMatchInlineSnapshot(`1`)
    expect(wallet.isEasyConfirmationEnabled).toMatchInlineSnapshot(`false`)
    expect(wallet.isHW).toMatchInlineSnapshot(`true`)
    expect(wallet.hwDeviceInfo).toMatchInlineSnapshot(`
          Object {
            "bip44AccountPublic": "1ba2332dca14d6f1f5a5282512e725852a34d3aee1cc26057e9cfb2c2730f1665934fa0b0fa42e16ded504fa81198e45dc22d10dab69398e730542a198dcbfcf",
            "hwFeatures": Object {
              "deviceId": "DE:F1:F3:14:AE:93",
              "deviceObj": null,
              "model": "Nano",
              "serialHex": "3af9018bbe99bb",
              "vendor": "ledger.com",
            },
          }
        `)
    expect(wallet.provider).toMatchInlineSnapshot(`undefined`)
    expect(wallet.checksum?.TextPart).toMatchInlineSnapshot(`"SHCZ-0679"`)
    expect(wallet.checksum?.ImagePart).toMatchInlineSnapshot(
      `"bc210d41df754ddf71057ea8186e7ec61f6effa28e5ea6a205684673da32eea2c3f4115ddd1fe9cbcbf7482cea56b16bd1244614d6e868ff433a92e01b92bcae"`,
    )
    expect(wallet.rewardAddressHex).toMatchInlineSnapshot(
      `"e19a38e3de94ca136b1a80fa90d7360ec1fe5a8dbc26d427ffece54ee2"`,
    )
    expect(wallet.publicKeyHex).toMatchInlineSnapshot(
      `"1ba2332dca14d6f1f5a5282512e725852a34d3aee1cc26057e9cfb2c2730f1665934fa0b0fa42e16ded504fa81198e45dc22d10dab69398e730542a198dcbfcf"`,
    )
    expect(wallet.utxos).toMatchInlineSnapshot(`Array []`)
    expect(wallet.internalAddresses).toMatchSnapshot()
    expect(wallet.externalAddresses).toMatchSnapshot()
    expect(wallet.transactions).toMatchInlineSnapshot(`Object {}`)
    expect(wallet.state).toMatchInlineSnapshot(`
          Object {
            "lastGeneratedAddressIndex": 0,
          }
          `)

    await expect(getBech32InternalChain(wallet)).resolves.toMatchInlineSnapshot(
      `"xpub1rw3rxtw2znt0rad99qj39ee9s54rf5awu8xzvpt7nnajcfes79n9jd86pv86gtskmm2sf75prx8ythpz6yx6k6fe3ees2s4pnrwtlnczfu90c"`,
    )
    expect(wallet.internalChain?._addressGenerator.toJSON().type).toMatchInlineSnapshot(`"Internal"`)
    expect(wallet.internalChain?._addressGenerator.toJSON().walletImplementationId).toMatchInlineSnapshot(
      `"haskell-shelley"`,
    )
    expect(
      (wallet.internalChain?._addressGenerator.toJSON() as ShelleyAddressGeneratorJSON).accountPubKeyHex,
    ).toMatchInlineSnapshot(
      `"1ba2332dca14d6f1f5a5282512e725852a34d3aee1cc26057e9cfb2c2730f1665934fa0b0fa42e16ded504fa81198e45dc22d10dab69398e730542a198dcbfcf"`,
    )

    expect(wallet.externalChain?._addressGenerator.toJSON().type).toMatchInlineSnapshot(`"External"`)
    expect(wallet.externalChain?._addressGenerator.toJSON().walletImplementationId).toMatchInlineSnapshot(
      `"haskell-shelley"`,
    )
    expect(
      (wallet.externalChain?._addressGenerator.toJSON() as ShelleyAddressGeneratorJSON).accountPubKeyHex,
    ).toMatchInlineSnapshot(
      `"1ba2332dca14d6f1f5a5282512e725852a34d3aee1cc26057e9cfb2c2730f1665934fa0b0fa42e16ded504fa81198e45dc22d10dab69398e730542a198dcbfcf"`,
    )

    expect(wallet.getChangeAddress()).toMatchInlineSnapshot(
      `"addr1qyeacjehv4qpyr68hszxdxrsx4whts8ctkeez4s0e0an6qy68r3aa9x2zd434q86jrtnvrkpledgm0px6snllm89fm3q85yacp"`,
    )

    await expect(getRewardAddress(wallet)).resolves.toMatchInlineSnapshot(
      `"stake1uxdr3c77jn9px6c6srafp4ekpmqluk5dhsndgfllanj5acsqkljgd"`,
    )

    expect(wallet.transactionCache?.perRewardAddressCertificates).toMatchInlineSnapshot(`Object {}`)
    expect(wallet.transactionCache?.confirmationCounts).toMatchInlineSnapshot(`Object {}`)
    expect(wallet.transactionCache?.perAddressTxs).toMatchInlineSnapshot(`Object {}`)
    expect(wallet.transactionCache?.transactions).toMatchInlineSnapshot(`Object {}`)

    expect(wallet.primaryToken).toMatchInlineSnapshot(`
      Object {
        "identifier": "",
        "isDefault": true,
        "metadata": Object {
          "assetName": "",
          "longName": null,
          "maxSupply": "45000000000000000",
          "numberOfDecimals": 6,
          "policyId": "",
          "ticker": "ADA",
          "type": "Cardano",
        },
        "networkId": 1,
      }
    `)
    await expect(getStakingKey(wallet)).resolves.toMatchInlineSnapshot(
      `"ed25519_pk1su9gfd9nkxw0uchht47cluxus3lqlf50mruvvuv2pqpph9qgmhzq08a7zq"`,
    )

    await expect(getWalletData(wallet)).resolves.toMatchSnapshot()
  })
})

const walletMeta: WalletMeta = {
  id: '261c7e0f-dd72-490c-8ce9-6714b512b969',
  name: 'My Wallet',
  networkId: 1,
  walletImplementationId: 'haskell-shelley',
  isHW: false,
  checksum: {
    ImagePart:
      '4252069ffbf52c5bbae1dd6a8e1801dd27cc279a88602292287146b21c5668edc8393502b27b21ca9954062ecde30beea06caf775a3580dd23017cfe19a2c2db',
    TextPart: 'OSEC-2869',
  },
  isEasyConfirmationEnabled: false,
  provider: '',
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
      'addr1q90qj49u70m8xa9v0f6d2frtvv33v5x4gwckvxllv6regw7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sv69ppj',
      'addr1qywqe88fzjjsm67f545mt49y05y2c73nh70ksnqlz63gadkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s6uufp3',
      'addr1qx8hn3xs999mlm4j222kd8vffpcst6r6k0g39t8gvqnu6ewprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9squh02k',
      'addr1q9znw64hsq8h8a448psmlnqj8ps4xsvf8r6xh9a2lkxl0mxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sqe0dcq',
      'addr1q84hv5gulacdfk3vgazkczfdcxm2zxj6r5dw4kjd922zwwxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s7r3sjk',
      'addr1qx0tafxrr4m3mpfaqvzcsr5r9h3xg4496l2760y63v430twprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9saavfdd',
      'addr1qxwsqdf7rylxgylsjwjrz8dkqwaaghrke9nrptmenvfjtfkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s3k9hm3',
      'addr1qycqg0xheczkysls9gxxc674r4pqnx24wc4y76hwtuw3fd7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9ssen4zt',
      'addr1qxqz59wn056mxapyxkkc483y4wv9q30ld0j6893zqqd0e8kprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sfhsgcv',
      'addr1q86hjvd26kd3e83wtm6pcms3vxuwduvp45k2jlyljdx4vrxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s3wngds',
      'addr1qyz33kjxyxslj8zv2zjh2k0gylk4hrcq6gcxsqfgk9vupmwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sxxhwzx',
      'addr1q8jesfd76w6kmamdmkwe3qfkyfxkadmxqgl9shlk3cgzfskprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s70w2fd',
      'addr1qy742dhpxf8cjclj3gdypz2ljk4yfeagc5n5hgsl7wl0llkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s4g5y22',
      'addr1q8hsmqcdejcru95aw94k2neeqfwmc4mt26cfm2dd2h3lq2kprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sqjwc06',
      'addr1qxt3w2q8gufqk5gzwcte9d77vc4gktw76l2y9nnhndsx6g7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9szy0fxh',
      'addr1qxwukyddw2dzjtqjrmlhgp65jlw5unzrtcvssh8vn0y0jskprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s8ypkqm',
      'addr1qxz63ljsfllxyhx8mwnqdldt8c9kev7vxcpcfrrdsa2p38kprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9spr65l5',
      'addr1qygsldpv8vqktwmsarmlkvfrv2x3zpaf40tvx9hmafpvhq7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9spxals6',
      'addr1q9xmphjk3wwalmtswfwysxx2e7tcsjvyjlgr0umnp5kr8ukprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sgz0flx',
      'addr1qx4n03xw7cv3xz6dfu6en4y5j022cuanur0tpd5m3nnee4wprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s9yuxgq',
      'addr1q9ppr5nqlsawu0wed9gmdlvj9f6u4ptatdckqu2caax7pkwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sktqhe5',
      'addr1qy0zcg79je62dvwdq52chx6wa6ckc83wxadl8p4l4rjzy3kprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sthnll8',
      'addr1qy9vghzazkuthdty4zrqs2pazdmnkqw4v0nlj8zf7d00ps7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9snkpvk9',
      'addr1qxxcl47mrkwj9qn3ceumsy8hdsrar7yhfu2se6e8wasc4fwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s2ahxyn',
      'addr1q8cp3xvwydxen5e4s8fzy4qvprqp7awuz9ycyd2g90hy2nkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sx02qkv',
      'addr1qyrxwash3njc9yncydvyvgpm3drg8fya5lku8pcxvrxplywprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sv6gdqj',
      'addr1q9mpr99v068vrf822qshe2ftcmc5uzu29c8j25ue0x9yyjwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s00c7v3',
      'addr1qx3x5wpck2rpmvqelfg3fpxf4k8ls6h4kanmjf99yr6xqc7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9syey28c',
      'addr1qyvfauzxh04t5l903543kxas3kt6lyjhm75jt7ygtljt0axprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9su72cd5',
      'addr1qxp2tcsx388pkznnqzjlwddnwnng93dkhmzun9qzyatjs57prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sptlmvc',
      'addr1qy4c5u4yjwav7fzupghy6x3yxtrc9ukeykvzl9nntqdff5xprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sz2hk37',
      'addr1q986w3r272pwu9k5667fk3rq76nt8lcpx46nrdxtyd2kr97prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9smhu3m9',
      'addr1qxhy6lheetrgllq9suft9th29j9xwe8c8e326svx9dqp9wwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9spq6wgc',
      'addr1q9s7ylecvvwurrljsnym9ydzyg9ew3nxj4a7c52prcwn337prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9srktt3q',
      'addr1qyv49cm9m32yn7qvsh52xynx964n8w0twq4hq33gv7vnswwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9suk565e',
      'addr1qy0ekzrns6xl99v4drncd3mllvnhg7te3krnjkj5n8d0yywprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s37rptt',
      'addr1qxmtkhcmxwack4eyr9ak5n5tp9nqlpdurdjy8dvsgu6qyw7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9ssyx5rs',
      'addr1q88ewyraqfr6eh20tt9a3kftykj66qa8wr39yrnykftkcv7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sneq8g7',
      'addr1q95cjmp5vstn2h039qhclnhn7utv3dp2af5l60wsfr68tuxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s67p9e2',
      'addr1q9ht5pk779yca3qn2fsnull4tp048ph59ekdj2zmmnhnvt7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sjwlmlf',
      'addr1q8llhnp2q4mw6fdrkd39agewph7egrqx9u9nkc8u68y8qvxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s2cw29n',
      'addr1qxsgt6xyl0r8nwm9vqnws4lm4zpk72vqza9mh9w0mt3z0e7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9su96d07',
      'addr1qyf2e7834sh3mgg77hdpgwg4y4avlv2ejv9ujnycvm2whvxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9su6a4ja',
      'addr1qxc363aewhytm67pgpt6ltweq32vthz822hvhks43vhyk47prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sq9cvws',
      'addr1q8f34p02gntax6cznwnn45ywlvnvaj382200vsury7u6zqkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s0n4mup',
      'addr1qxvrxnsxyndu5wm30j3qdpluwhraqyg9wvutjphkn6peyakprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9suahxws',
      'addr1q80e66n7dzzqdjyfmwjy9dn9hyttausv7vs8fzyx2nakpgxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sc03ymw',
      'addr1qxrz0tms6erhqhpfp4lsstghmty25mlsvxaklg908wsgpl7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9svgsvzg',
      'addr1q8pw4q7jnd4fqjd9d5fst6ve44j6kpgpdms3wdfp38cl6kxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s5l2qqd',
      'addr1q88rzw386l44k29ssva2n9a8h9pqmppjyn9wddzcs9x2w6kprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sc6qvra',
    ],
    addressGenerator: {
      accountPubKeyHex:
        '6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665',
      walletImplementationId: 'haskell-shelley',
      type: 'Internal',
    },
  },
  externalChain: {
    gapLimit: 20,
    blockSize: 50,
    addresses: [
      'addr1qxddgtdqxmsvn0rqp0ltdfpddudvf76qs3esyn3zqf44drkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9suclpck',
      'addr1qyxg9e0wj478cd6ckvgwgxj075q6hxz2aeepgf6uxv8ju0kprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s7yq5yx',
      'addr1qxkpmv5pzle28wv52v9p0gpsuw90r35wyj903ay99ehpcwkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9snaf0vm',
      'addr1q9fzmrqgzs4hwrelsckyc4d7hwe4flns7ctdfe2v3p2m8mkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sgsalrm',
      'addr1qx4jgp3tw82jse44g4pe40c6kf0da4k79y7h59ppw8yayl7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s2daxfx',
      'addr1q9kvvf0tphw8vyy9ym6shyrzduuzn9fjn2e2x7dqw64j7twprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9smq76na',
      'addr1q87lqme8a9swxma4wtx0uth3ydra5yc2lvz77dkrqkxnelxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s9kzqmw',
      'addr1q99pnu98dnjak889hw3eaccz3z6u66m4n6es4l2x0smam0wprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sznfrlv',
      'addr1q8exj6h7339a5atzjw6nhvtdlp8unmte5pw4mq86n5zqxrwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sfwrgj3',
      'addr1qxhe24p4qarnwa6tplqyr6en5p0dnt8h0ntmytqgs5ct4fkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9syk9wx4',
      'addr1q9tz4h9mna4mc8luvd7yfdd9uwctrryhjvklqf9ka6kvxxxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9shwuqg5',
      'addr1qyz54utwy5j95q7l2pe60m4agw52zptr92frjumsykycu6xprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sxmn8j5',
      'addr1qxux603eqzephhynffsfh6ghuxnda979p55jmng6z5gw6hwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s4qx8m6',
      'addr1qyrj2j3ddm99zf08mr85cfcsaw84qn84pgjfmagnjr37tvxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9svshgpk',
      'addr1q82djcr8qye89gavgmdvj0r0d4v4wc4xysegq8vzh0sfg7xprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s88sj92',
      'addr1q8lg0h0kz6tm3jwtlr2ua5wcmfm5xkr4l786y8ct7xfau37prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sudjd4w',
      'addr1q83y56gq57pjnppz40h4sn49u0qnurcckwfvwv0mdhdht7xprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s9mugcd',
      'addr1q97y9qgg2dvsnj6gp27d2fcw5kwuae237wf4w3qr73an48wprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s2ec3mt',
      'addr1qxx5vxfjy8qswsjapadl84lgzn8kmj52q3kmjh6yy2kpygwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sd88ayj',
      'addr1q92wmrzhm0rhvp3ly45hy0wlcgru90pl87ml66ydd6y3f37prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sqhlc50',
      'addr1q8s590jmfveprz92gcxhznj6x8f6h77h64qucxhq73wtun7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sfkcs93',
      'addr1qy3le04j8g00e2py5k6kuzczeepeqpn0tqjeeaptvndzmcxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9slsnn6h',
      'addr1qxjylhr0rrj7cvxr9rkylwx989hl9a6dlcvnha7w9d5y9vxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s3c6vru',
      'addr1qxcer5v0smzg3r58amj05sl33j4jlmn3gktcvx2s2wzsz0xprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sy440ea',
      'addr1q93tfxasddxprwwhnq5yuh0sd6l0k3gnnjvx54rzt9rw72wprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sz86492',
      'addr1q862tlp3umlrugwlc8a3zwev46xfyhqp8x5wn3mw4tmj6wxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9svqfgp8',
      'addr1qxez55am422zhn2tr0h04azm0wsk4pkw86pcfs9vwc60xx7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s5sfj5r',
      'addr1q8vfpv29m850jj20fd7f3a3te0vrgczvp0zgvvdn4j8pefwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sx4cq9j',
      'addr1q89tjkjztmkje6ef9gql75wd9aw9xlswfwscwuc489gjctwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9suwktax',
      'addr1qxdd95zyjr0esqpe4qxv4k79lrfdeatwpxh0hkvav6gep67prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sxy8zw0',
      'addr1qyaeey6a52hmm6sjenhzjhrddtt9l0ha90gyz7x0gtwj9l7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sg2ekvk',
      'addr1qyw2x7xf25dqcuz4atvffvg95twd93zfpfz96r3m0z6ecexprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sxh76tl',
      'addr1qxwlxpc6r783ls0nxv5czjw6yp69w5gwqmljrhtphc63wk7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sahkvp7',
      'addr1q87eqc9jjaukyp08t5pudxn98lntvkpqmfgqcrk3jn8q5akprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9scxeyth',
      'addr1q8w2pdygajte5gpj4nd9ml39a3u0zduqnxakppuvpx4cpewprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s2cf0ct',
      'addr1qx3pqcgzjnnvz265vdruatx5zgj5d9h46q53zj63lzxskhkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sxg429c',
      'addr1q8zn5n25yc326q5t783dhq4vx04m3mp7l3pu07fnu09udskprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sguncdq',
      'addr1qyqu3wyj8aq5n7h8hdy5yhzmeucnp4a6l2y668xl3z5vm5xprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s56d5rp',
      'addr1qxhwvnzxy65yd9rztc9hm4wq4mjn8f63umffj7wzpmce3s7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s3zxlw9',
      'addr1q9m4ua4nswv46cn7m2usqzv86kt30ku5mz3cfvsqfeg6luxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9smhsrt2',
      'addr1q9sqz5z6xy2kmcma00ks9w04qspepat5qw0n3ve4y5wxeuwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s2d2pz2',
      'addr1q9jmtp74vmg73nu3n0jj2r9nwf5pwckk3uhtfwqzqxkpvekprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9srcs4xc',
      'addr1qxszt0hfp387c3zhwx0yfkzmpqdm84emtdmlv48542kdehwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9ssarq2e',
      'addr1q9w7ny6vwjytzz5yyg0rzv9pde8qwhns66c9jkhxh26v2ywprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9shymkjl',
      'addr1q8fezaq8fl35j8rcnvk8szu6kwq47cmjmslyvregfuywh97prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9swyfxdh',
      'addr1qym37v8g7e3m8cl4w86uyck20h9ytsxcqedc3hj33pft6fwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sy3xv9l',
      'addr1q9lmjl74935s9xh47cmqyf6ly8yul8rtz9t2cuxc9lc5uewprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sy3g0an',
      'addr1qxgy0j8t99vf894lpm2hunwh9cszmunzel4qj5zk7snm57kprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9slpykq3',
      'addr1q8ft85wfghg46u5mnzahp797pza3heu7mdjj8q9rxrd8v67prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sqgz7v7',
      'addr1q87squraxa3a5v0zyv8wf8g5vwmx5pcxje02fd09gjx42v7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9slatf0d',
    ],
    addressGenerator: {
      accountPubKeyHex:
        '6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665',
      walletImplementationId: 'haskell-shelley',
      type: 'External',
    },
  },
  networkId: 1,
  walletImplementationId: 'haskell-shelley',
  isHW: false,
  hwDeviceInfo: null,
  isReadOnly: false,
  isEasyConfirmationEnabled: false,
  provider: '',
}

const getBech32InternalChain = (wallet: any) => wallet.internalChain?._addressGenerator._accountPubKeyPtr?.toBech32()
const getRewardAddress = (wallet: any) => wallet.getRewardAddress().then((address) => address.toBech32())
const getWalletData = (wallet: any) => wallet.storage.getItem(`data`)
const getStakingKey = (wallet: any) => wallet.getStakingKey().then((key) => key.toBech32())
