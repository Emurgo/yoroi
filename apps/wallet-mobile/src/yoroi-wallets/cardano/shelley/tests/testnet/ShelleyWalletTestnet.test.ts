/* eslint-disable @typescript-eslint/no-explicit-any */
import {Address} from '@emurgo/cross-csl-core'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {Balance, Chain} from '@yoroi/types'

import {buildPortfolioTokenManagers} from '../../../../../features/Portfolio/common/helpers/build-token-managers'
import {WalletMeta} from '../../../../../features/WalletManager/common/types'
import {getWalletFactory} from '../../../../../features/WalletManager/network-manager/helpers/get-wallet-factory'
import {buildNetworkManagers} from '../../../../../features/WalletManager/network-manager/network-manager'
import {EncryptedStorage, EncryptedStorageKeys} from '../../../../../kernel/storage/EncryptedStorage'
import {rootStorage} from '../../../../../kernel/storage/rootStorage'
import {HWDeviceInfo} from '../../../../hw'
import {DefaultAsset} from '../../../../types'
import {ShelleyAddressGeneratorJSON} from '../../../chain'
import {WalletJSON} from '../../../shelley/ShelleyWallet'
import {YoroiWallet} from '../../../types'

describe('ShelleyWalletTestnet', () => {
  afterEach(() => AsyncStorage.clear())

  const ShelleyWalletTestnet = getWalletFactory({
    implementationId: 'haskell-shelley',
    network: Chain.Network.Preprod,
  })
  // TODO: should be mocked
  const networkManagers = buildNetworkManagers({
    tokenManagers: buildPortfolioTokenManagers().tokenManagers,
  })

  it('create', async () => {
    const mnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon oak'
    const password = 'password'

    const wallet: YoroiWallet & Record<string, any> = await ShelleyWalletTestnet.create({
      id: walletMeta.id,
      mnemonic,
      storage: rootStorage.join(`${walletMeta.id}/`),
      password,
      networkManager: networkManagers.preprod,
    })

    expect(wallet.id).toBe('261c7e0f-dd72-490c-8ce9-6714b512b969')
    expect(wallet.networkId).toBe(300)
    expect(wallet.isHW).toBe(false)
    expect(wallet.hwDeviceInfo).toBe(null)
    expect(wallet.checksum?.TextPart).toBe('OSEC-2869')
    expect(wallet.checksum?.ImagePart).toBe(
      '4252069ffbf52c5bbae1dd6a8e1801dd27cc279a88602292287146b21c5668edc8393502b27b21ca9954062ecde30beea06caf775a3580dd23017cfe19a2c2db',
    )
    expect(wallet.rewardAddressHex).toBe('e0c11ef08c44f3610b7e56d46e086b90186c12e9a68f0521b7c4c72e4b')
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

    await expect(getBech32InternalChain(wallet)).resolves.toBe(
      'xpub1ds33reh84y6828z4q4xtyx4cgnew2ka2fr7g72vd64zrpugk68q5chcj69tpzecy2ns9a7k8f6846h5g0t3vzhhnpphqdywsmppevegxuvdnj',
    )
    expect(wallet.internalChain?._addressGenerator.toJSON().type).toBe('Internal')
    expect(wallet.internalChain?._addressGenerator.toJSON().walletImplementationId).toBe('haskell-shelley')
    expect((wallet.internalChain?._addressGenerator.toJSON() as ShelleyAddressGeneratorJSON).accountPubKeyHex).toBe(
      '6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665',
    )

    expect(wallet.externalChain?._addressGenerator.toJSON().type).toBe('External')
    expect(wallet.externalChain?._addressGenerator.toJSON().walletImplementationId).toBe('haskell-shelley')
    expect((wallet.externalChain?._addressGenerator.toJSON() as ShelleyAddressGeneratorJSON).accountPubKeyHex).toBe(
      '6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665',
    )

    // Decrypted Root Key / Change Password
    expect(wallet.getDecryptedRootKey('wrong password')).rejects.toThrowErrorMatchingInlineSnapshot(`""`)
    await expect(wallet.getDecryptedRootKey(password)).resolves.toBe(
      'a0cf109fd1346748a20f2ade2b3d1e1561485d2f28ae6d8c36e289b4d0ca22544b4e892132ca15095d48370d4cb2bc7c8cde3f68b8a2f63cfeda4c5ac2752599065111b0929f2b3e6fa0f4bddbc90f9a00d1997d4164f6361d2c0f3c4be1f050',
    )

    expect(wallet.changePassword('wrong password', 'new password')).rejects.toThrowErrorMatchingInlineSnapshot(`""`)
    const newPassword = 'new-password'
    await wallet.changePassword(password, newPassword)

    expect(wallet.getDecryptedRootKey(password)).rejects.toThrowErrorMatchingInlineSnapshot(`""`)
    await expect(wallet.getDecryptedRootKey(newPassword)).resolves.toBe(
      'a0cf109fd1346748a20f2ade2b3d1e1561485d2f28ae6d8c36e289b4d0ca22544b4e892132ca15095d48370d4cb2bc7c8cde3f68b8a2f63cfeda4c5ac2752599065111b0929f2b3e6fa0f4bddbc90f9a00d1997d4164f6361d2c0f3c4be1f050',
    )

    expect(wallet.getChangeAddress()).toBe(
      'addr_test1qp0qj49u70m8xa9v0f6d2frtvv33v5x4gwckvxllv6regw7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s0vcpdd',
    )

    await expect(getRewardAddress(wallet)).resolves.toBe(
      'addr_test1qzddgtdqxmsvn0rqp0ltdfpddudvf76qs3esyn3zqf44drkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9slwzp5f',
    )

    expect(wallet.primaryToken).toEqual<DefaultAsset>({
      identifier: '',
      isDefault: true,
      metadata: {
        assetName: '',
        longName: null,
        maxSupply: '45000000000000000',
        numberOfDecimals: 6,
        policyId: '',
        ticker: 'TADA',
        type: 'Cardano',
      },
      networkId: 300,
    })
    expect(wallet.primaryTokenInfo).toEqual<Balance.TokenInfo>({
      kind: 'ft',
      id: '',
      name: 'TADA',
      description: 'Cardano',
      fingerprint: '',
      decimals: 6,
      ticker: 'TADA',
      image: '',
      icon: '',
      group: '',
      symbol: '₳',
      metadatas: {},
    })
    await expect(getStakingKey(wallet)).resolves.toBe(
      'ed25519_pk158gpk02jqrsxa58aw2e4f0ww6fffu7p2qsflenapdz7a3r5lxx4sn9nx84',
    )

    await expect(getWalletData(wallet)).resolves.toMatchSnapshot()
  })

  it('restore', async () => {
    rootStorage.setItem(`${walletMeta.id}`, walletMeta)
    rootStorage.setItem(`${walletMeta.id}/data`, data)

    const rootKey =
      'a0cf109fd1346748a20f2ade2b3d1e1561485d2f28ae6d8c36e289b4d0ca22544b4e892132ca15095d48370d4cb2bc7c8cde3f68b8a2f63cfeda4c5ac2752599065111b0929f2b3e6fa0f4bddbc90f9a00d1997d4164f6361d2c0f3c4be1f050'
    const password = 'password'
    await EncryptedStorage.write(EncryptedStorageKeys.rootKey(walletMeta.id), rootKey, password)

    const wallet: YoroiWallet & Record<string, any> = await ShelleyWalletTestnet.restore({
      storage: rootStorage.join(`${walletMeta.id}/`),
      walletMeta,
      networkManager: networkManagers.preprod,
    })
    await wallet.internalChain?._addressGenerator.getRewardAddressHex()

    expect(wallet.id).toBe('261c7e0f-dd72-490c-8ce9-6714b512b969')
    expect(wallet.networkId).toBe(300)
    expect(wallet.isHW).toBe(false)
    expect(wallet.hwDeviceInfo).toBe(null)
    expect(wallet.checksum?.TextPart).toBe('OSEC-2869')
    expect(wallet.checksum?.ImagePart).toBe(
      '4252069ffbf52c5bbae1dd6a8e1801dd27cc279a88602292287146b21c5668edc8393502b27b21ca9954062ecde30beea06caf775a3580dd23017cfe19a2c2db',
    )
    expect(wallet.rewardAddressHex).toBe('e0c11ef08c44f3610b7e56d46e086b90186c12e9a68f0521b7c4c72e4b')
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

    await expect(getBech32InternalChain(wallet)).resolves.toBe(
      'xpub1ds33reh84y6828z4q4xtyx4cgnew2ka2fr7g72vd64zrpugk68q5chcj69tpzecy2ns9a7k8f6846h5g0t3vzhhnpphqdywsmppevegxuvdnj',
    )
    expect(wallet.internalChain?._addressGenerator.toJSON().type).toBe('Internal')
    expect(wallet.internalChain?._addressGenerator.toJSON().walletImplementationId).toBe('haskell-shelley')
    expect((wallet.internalChain?._addressGenerator.toJSON() as ShelleyAddressGeneratorJSON).accountPubKeyHex).toBe(
      '6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665',
    )

    expect(wallet.externalChain?._addressGenerator.toJSON().type).toBe('External')
    expect(wallet.externalChain?._addressGenerator.toJSON().walletImplementationId).toBe('haskell-shelley')
    expect((wallet.externalChain?._addressGenerator.toJSON() as ShelleyAddressGeneratorJSON).accountPubKeyHex).toBe(
      '6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665',
    )

    // Decrypted Root Key / Change Password
    expect(wallet.getDecryptedRootKey('wrong password')).rejects.toThrowErrorMatchingInlineSnapshot(`""`)
    await expect(wallet.getDecryptedRootKey(password)).resolves.toBe(
      'a0cf109fd1346748a20f2ade2b3d1e1561485d2f28ae6d8c36e289b4d0ca22544b4e892132ca15095d48370d4cb2bc7c8cde3f68b8a2f63cfeda4c5ac2752599065111b0929f2b3e6fa0f4bddbc90f9a00d1997d4164f6361d2c0f3c4be1f050',
    )

    expect(wallet.changePassword('wrong password', 'new password')).rejects.toThrowErrorMatchingInlineSnapshot(`""`)
    const newPassword = 'new-password'
    await wallet.changePassword(password, newPassword)

    expect(wallet.getDecryptedRootKey(password)).rejects.toThrowErrorMatchingInlineSnapshot(`""`)
    await expect(wallet.getDecryptedRootKey(newPassword)).resolves.toBe(
      'a0cf109fd1346748a20f2ade2b3d1e1561485d2f28ae6d8c36e289b4d0ca22544b4e892132ca15095d48370d4cb2bc7c8cde3f68b8a2f63cfeda4c5ac2752599065111b0929f2b3e6fa0f4bddbc90f9a00d1997d4164f6361d2c0f3c4be1f050',
    )

    expect(wallet.getChangeAddress()).toBe(
      'addr_test1q90qj49u70m8xa9v0f6d2frtvv33v5x4gwckvxllv6regw7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sv69ppj',
    )

    await expect(getRewardAddress(wallet)).resolves.toBe(
      'addr_test1qpyz4c9m9ak7y6nzg8qdgz8u5ulyyjkdz853cr98hyu69yy68r3aa9x2zd434q86jrtnvrkpledgm0px6snllm89fm3qy42hkq',
    )

    expect(wallet.primaryToken).toEqual<DefaultAsset>({
      identifier: '',
      isDefault: true,
      metadata: {
        assetName: '',
        longName: null,
        maxSupply: '45000000000000000',
        numberOfDecimals: 6,
        policyId: '',
        ticker: 'TADA',
        type: 'Cardano',
      },
      networkId: 300,
    })
    expect(wallet.primaryTokenInfo).toEqual<Balance.TokenInfo>({
      kind: 'ft',
      id: '',
      name: 'TADA',
      description: 'Cardano',
      fingerprint: '',
      decimals: 6,
      ticker: 'TADA',
      image: '',
      icon: '',
      group: '',
      symbol: '₳',
      metadatas: {},
    })
    await expect(getStakingKey(wallet)).resolves.toBe(
      'ed25519_pk158gpk02jqrsxa58aw2e4f0ww6fffu7p2qsflenapdz7a3r5lxx4sn9nx84',
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

    const wallet: YoroiWallet & Record<string, any> = await ShelleyWalletTestnet.createBip44({
      id: walletMeta.id,
      accountPubKeyHex,
      storage: rootStorage.join(`${walletMeta.id}/`),
      hwDeviceInfo,
      isReadOnly,
      networkManager: networkManagers.preprod,
    })

    expect(wallet.id).toBe('261c7e0f-dd72-490c-8ce9-6714b512b969')
    expect(wallet.networkId).toBe(300)
    expect(wallet.isHW).toBe(true)
    expect(wallet.hwDeviceInfo).toEqual(hwDeviceInfo)
    expect(wallet.checksum?.TextPart).toBe('SHCZ-0679')
    expect(wallet.checksum?.ImagePart).toBe(
      'bc210d41df754ddf71057ea8186e7ec61f6effa28e5ea6a205684673da32eea2c3f4115ddd1fe9cbcbf7482cea56b16bd1244614d6e868ff433a92e01b92bcae',
    )
    expect(wallet.rewardAddressHex).toBe('e09a38e3de94ca136b1a80fa90d7360ec1fe5a8dbc26d427ffece54ee2')
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

    await expect(getBech32InternalChain(wallet)).resolves.toBe(
      'xpub1rw3rxtw2znt0rad99qj39ee9s54rf5awu8xzvpt7nnajcfes79n9jd86pv86gtskmm2sf75prx8ythpz6yx6k6fe3ees2s4pnrwtlnczfu90c',
    )
    expect(wallet.internalChain?._addressGenerator.toJSON().type).toBe('Internal')
    expect(wallet.internalChain?._addressGenerator.toJSON().walletImplementationId).toBe('haskell-shelley')
    expect((wallet.internalChain?._addressGenerator.toJSON() as ShelleyAddressGeneratorJSON).accountPubKeyHex).toBe(
      '1ba2332dca14d6f1f5a5282512e725852a34d3aee1cc26057e9cfb2c2730f1665934fa0b0fa42e16ded504fa81198e45dc22d10dab69398e730542a198dcbfcf',
    )

    expect(wallet.externalChain?._addressGenerator.toJSON().type).toBe('External')
    expect(wallet.externalChain?._addressGenerator.toJSON().walletImplementationId).toBe('haskell-shelley')
    expect((wallet.externalChain?._addressGenerator.toJSON() as ShelleyAddressGeneratorJSON).accountPubKeyHex).toBe(
      '1ba2332dca14d6f1f5a5282512e725852a34d3aee1cc26057e9cfb2c2730f1665934fa0b0fa42e16ded504fa81198e45dc22d10dab69398e730542a198dcbfcf',
    )

    expect(wallet.getChangeAddress()).toBe(
      'addr_test1qqeacjehv4qpyr68hszxdxrsx4whts8ctkeez4s0e0an6qy68r3aa9x2zd434q86jrtnvrkpledgm0px6snllm89fm3qyzea57',
    )

    await expect(getRewardAddress(wallet)).resolves.toBe(
      'addr_test1qpyz4c9m9ak7y6nzg8qdgz8u5ulyyjkdz853cr98hyu69yy68r3aa9x2zd434q86jrtnvrkpledgm0px6snllm89fm3qy42hkq',
    )

    expect(wallet.primaryToken).toEqual<DefaultAsset>({
      identifier: '',
      isDefault: true,
      metadata: {
        assetName: '',
        longName: null,
        maxSupply: '45000000000000000',
        numberOfDecimals: 6,
        policyId: '',
        ticker: 'TADA',
        type: 'Cardano',
      },
      networkId: 300,
    })
    expect(wallet.primaryTokenInfo).toEqual<Balance.TokenInfo>({
      kind: 'ft',
      id: '',
      name: 'TADA',
      description: 'Cardano',
      fingerprint: '',
      decimals: 6,
      ticker: 'TADA',
      image: '',
      icon: '',
      group: '',
      symbol: '₳',
      metadatas: {},
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
  networkId: 1,
  walletImplementationId: 'haskell-shelley',
  isHW: false,
  checksum: {
    ImagePart:
      '4252069ffbf52c5bbae1dd6a8e1801dd27cc279a88602292287146b21c5668edc8393502b27b21ca9954062ecde30beea06caf775a3580dd23017cfe19a2c2db',
    TextPart: 'OSEC-2869',
  },
  isEasyConfirmationEnabled: false,
  addressMode: 'multiple',
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
      'addr_test1q90qj49u70m8xa9v0f6d2frtvv33v5x4gwckvxllv6regw7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sv69ppj',
      'addr_test1qywqe88fzjjsm67f545mt49y05y2c73nh70ksnqlz63gadkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s6uufp3',
      'addr_test1qx8hn3xs999mlm4j222kd8vffpcst6r6k0g39t8gvqnu6ewprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9squh02k',
      'addr_test1q9znw64hsq8h8a448psmlnqj8ps4xsvf8r6xh9a2lkxl0mxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sqe0dcq',
      'addr_test1q84hv5gulacdfk3vgazkczfdcxm2zxj6r5dw4kjd922zwwxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s7r3sjk',
      'addr_test1qx0tafxrr4m3mpfaqvzcsr5r9h3xg4496l2760y63v430twprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9saavfdd',
      'addr_test1qxwsqdf7rylxgylsjwjrz8dkqwaaghrke9nrptmenvfjtfkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s3k9hm3',
      'addr_test1qycqg0xheczkysls9gxxc674r4pqnx24wc4y76hwtuw3fd7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9ssen4zt',
      'addr_test1qxqz59wn056mxapyxkkc483y4wv9q30ld0j6893zqqd0e8kprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sfhsgcv',
      'addr_test1q86hjvd26kd3e83wtm6pcms3vxuwduvp45k2jlyljdx4vrxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s3wngds',
      'addr_test1qyz33kjxyxslj8zv2zjh2k0gylk4hrcq6gcxsqfgk9vupmwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sxxhwzx',
      'addr_test1q8jesfd76w6kmamdmkwe3qfkyfxkadmxqgl9shlk3cgzfskprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s70w2fd',
      'addr_test1qy742dhpxf8cjclj3gdypz2ljk4yfeagc5n5hgsl7wl0llkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s4g5y22',
      'addr_test1q8hsmqcdejcru95aw94k2neeqfwmc4mt26cfm2dd2h3lq2kprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sqjwc06',
      'addr_test1qxt3w2q8gufqk5gzwcte9d77vc4gktw76l2y9nnhndsx6g7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9szy0fxh',
      'addr_test1qxwukyddw2dzjtqjrmlhgp65jlw5unzrtcvssh8vn0y0jskprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s8ypkqm',
      'addr_test1qxz63ljsfllxyhx8mwnqdldt8c9kev7vxcpcfrrdsa2p38kprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9spr65l5',
      'addr_test1qygsldpv8vqktwmsarmlkvfrv2x3zpaf40tvx9hmafpvhq7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9spxals6',
      'addr_test1q9xmphjk3wwalmtswfwysxx2e7tcsjvyjlgr0umnp5kr8ukprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sgz0flx',
      'addr_test1qx4n03xw7cv3xz6dfu6en4y5j022cuanur0tpd5m3nnee4wprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s9yuxgq',
      'addr_test1q9ppr5nqlsawu0wed9gmdlvj9f6u4ptatdckqu2caax7pkwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sktqhe5',
      'addr_test1qy0zcg79je62dvwdq52chx6wa6ckc83wxadl8p4l4rjzy3kprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sthnll8',
      'addr_test1qy9vghzazkuthdty4zrqs2pazdmnkqw4v0nlj8zf7d00ps7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9snkpvk9',
      'addr_test1qxxcl47mrkwj9qn3ceumsy8hdsrar7yhfu2se6e8wasc4fwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s2ahxyn',
      'addr_test1q8cp3xvwydxen5e4s8fzy4qvprqp7awuz9ycyd2g90hy2nkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sx02qkv',
      'addr_test1qyrxwash3njc9yncydvyvgpm3drg8fya5lku8pcxvrxplywprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sv6gdqj',
      'addr_test1q9mpr99v068vrf822qshe2ftcmc5uzu29c8j25ue0x9yyjwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s00c7v3',
      'addr_test1qx3x5wpck2rpmvqelfg3fpxf4k8ls6h4kanmjf99yr6xqc7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9syey28c',
      'addr_test1qyvfauzxh04t5l903543kxas3kt6lyjhm75jt7ygtljt0axprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9su72cd5',
      'addr_test1qxp2tcsx388pkznnqzjlwddnwnng93dkhmzun9qzyatjs57prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sptlmvc',
      'addr_test1qy4c5u4yjwav7fzupghy6x3yxtrc9ukeykvzl9nntqdff5xprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sz2hk37',
      'addr_test1q986w3r272pwu9k5667fk3rq76nt8lcpx46nrdxtyd2kr97prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9smhu3m9',
      'addr_test1qxhy6lheetrgllq9suft9th29j9xwe8c8e326svx9dqp9wwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9spq6wgc',
      'addr_test1q9s7ylecvvwurrljsnym9ydzyg9ew3nxj4a7c52prcwn337prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9srktt3q',
      'addr_test1qyv49cm9m32yn7qvsh52xynx964n8w0twq4hq33gv7vnswwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9suk565e',
      'addr_test1qy0ekzrns6xl99v4drncd3mllvnhg7te3krnjkj5n8d0yywprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s37rptt',
      'addr_test1qxmtkhcmxwack4eyr9ak5n5tp9nqlpdurdjy8dvsgu6qyw7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9ssyx5rs',
      'addr_test1q88ewyraqfr6eh20tt9a3kftykj66qa8wr39yrnykftkcv7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sneq8g7',
      'addr_test1q95cjmp5vstn2h039qhclnhn7utv3dp2af5l60wsfr68tuxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s67p9e2',
      'addr_test1q9ht5pk779yca3qn2fsnull4tp048ph59ekdj2zmmnhnvt7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sjwlmlf',
      'addr_test1q8llhnp2q4mw6fdrkd39agewph7egrqx9u9nkc8u68y8qvxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s2cw29n',
      'addr_test1qxsgt6xyl0r8nwm9vqnws4lm4zpk72vqza9mh9w0mt3z0e7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9su96d07',
      'addr_test1qyf2e7834sh3mgg77hdpgwg4y4avlv2ejv9ujnycvm2whvxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9su6a4ja',
      'addr_test1qxc363aewhytm67pgpt6ltweq32vthz822hvhks43vhyk47prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sq9cvws',
      'addr_test1q8f34p02gntax6cznwnn45ywlvnvaj382200vsury7u6zqkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s0n4mup',
      'addr_test1qxvrxnsxyndu5wm30j3qdpluwhraqyg9wvutjphkn6peyakprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9suahxws',
      'addr_test1q80e66n7dzzqdjyfmwjy9dn9hyttausv7vs8fzyx2nakpgxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sc03ymw',
      'addr_test1qxrz0tms6erhqhpfp4lsstghmty25mlsvxaklg908wsgpl7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9svgsvzg',
      'addr_test1q8pw4q7jnd4fqjd9d5fst6ve44j6kpgpdms3wdfp38cl6kxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s5l2qqd',
      'addr_test1q88rzw386l44k29ssva2n9a8h9pqmppjyn9wddzcs9x2w6kprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sc6qvra',
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
      'addr_test1qpyz4c9m9ak7y6nzg8qdgz8u5ulyyjkdz853cr98hyu69yy68r3aa9x2zd434q86jrtnvrkpledgm0px6snllm89fm3qy42hkq',
      'addr_test1qyxg9e0wj478cd6ckvgwgxj075q6hxz2aeepgf6uxv8ju0kprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s7yq5yx',
      'addr_test1qxkpmv5pzle28wv52v9p0gpsuw90r35wyj903ay99ehpcwkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9snaf0vm',
      'addr_test1q9fzmrqgzs4hwrelsckyc4d7hwe4flns7ctdfe2v3p2m8mkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sgsalrm',
      'addr_test1qx4jgp3tw82jse44g4pe40c6kf0da4k79y7h59ppw8yayl7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s2daxfx',
      'addr_test1q9kvvf0tphw8vyy9ym6shyrzduuzn9fjn2e2x7dqw64j7twprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9smq76na',
      'addr_test1q87lqme8a9swxma4wtx0uth3ydra5yc2lvz77dkrqkxnelxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s9kzqmw',
      'addr_test1q99pnu98dnjak889hw3eaccz3z6u66m4n6es4l2x0smam0wprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sznfrlv',
      'addr_test1q8exj6h7339a5atzjw6nhvtdlp8unmte5pw4mq86n5zqxrwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sfwrgj3',
      'addr_test1qxhe24p4qarnwa6tplqyr6en5p0dnt8h0ntmytqgs5ct4fkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9syk9wx4',
      'addr_test1q9tz4h9mna4mc8luvd7yfdd9uwctrryhjvklqf9ka6kvxxxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9shwuqg5',
      'addr_test1qyz54utwy5j95q7l2pe60m4agw52zptr92frjumsykycu6xprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sxmn8j5',
      'addr_test1qxux603eqzephhynffsfh6ghuxnda979p55jmng6z5gw6hwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s4qx8m6',
      'addr_test1qyrj2j3ddm99zf08mr85cfcsaw84qn84pgjfmagnjr37tvxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9svshgpk',
      'addr_test1q82djcr8qye89gavgmdvj0r0d4v4wc4xysegq8vzh0sfg7xprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s88sj92',
      'addr_test1q8lg0h0kz6tm3jwtlr2ua5wcmfm5xkr4l786y8ct7xfau37prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sudjd4w',
      'addr_test1q83y56gq57pjnppz40h4sn49u0qnurcckwfvwv0mdhdht7xprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s9mugcd',
      'addr_test1q97y9qgg2dvsnj6gp27d2fcw5kwuae237wf4w3qr73an48wprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s2ec3mt',
      'addr_test1qxx5vxfjy8qswsjapadl84lgzn8kmj52q3kmjh6yy2kpygwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sd88ayj',
      'addr_test1q92wmrzhm0rhvp3ly45hy0wlcgru90pl87ml66ydd6y3f37prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sqhlc50',
      'addr_test1q8s590jmfveprz92gcxhznj6x8f6h77h64qucxhq73wtun7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sfkcs93',
      'addr_test1qy3le04j8g00e2py5k6kuzczeepeqpn0tqjeeaptvndzmcxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9slsnn6h',
      'addr_test1qxjylhr0rrj7cvxr9rkylwx989hl9a6dlcvnha7w9d5y9vxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s3c6vru',
      'addr_test1qxcer5v0smzg3r58amj05sl33j4jlmn3gktcvx2s2wzsz0xprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sy440ea',
      'addr_test1q93tfxasddxprwwhnq5yuh0sd6l0k3gnnjvx54rzt9rw72wprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sz86492',
      'addr_test1q862tlp3umlrugwlc8a3zwev46xfyhqp8x5wn3mw4tmj6wxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9svqfgp8',
      'addr_test1qxez55am422zhn2tr0h04azm0wsk4pkw86pcfs9vwc60xx7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s5sfj5r',
      'addr_test1q8vfpv29m850jj20fd7f3a3te0vrgczvp0zgvvdn4j8pefwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sx4cq9j',
      'addr_test1q89tjkjztmkje6ef9gql75wd9aw9xlswfwscwuc489gjctwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9suwktax',
      'addr_test1qxdd95zyjr0esqpe4qxv4k79lrfdeatwpxh0hkvav6gep67prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sxy8zw0',
      'addr_test1qyaeey6a52hmm6sjenhzjhrddtt9l0ha90gyz7x0gtwj9l7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sg2ekvk',
      'addr_test1qyw2x7xf25dqcuz4atvffvg95twd93zfpfz96r3m0z6ecexprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sxh76tl',
      'addr_test1qxwlxpc6r783ls0nxv5czjw6yp69w5gwqmljrhtphc63wk7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sahkvp7',
      'addr_test1q87eqc9jjaukyp08t5pudxn98lntvkpqmfgqcrk3jn8q5akprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9scxeyth',
      'addr_test1q8w2pdygajte5gpj4nd9ml39a3u0zduqnxakppuvpx4cpewprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s2cf0ct',
      'addr_test1qx3pqcgzjnnvz265vdruatx5zgj5d9h46q53zj63lzxskhkprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sxg429c',
      'addr_test1q8zn5n25yc326q5t783dhq4vx04m3mp7l3pu07fnu09udskprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sguncdq',
      'addr_test1qyqu3wyj8aq5n7h8hdy5yhzmeucnp4a6l2y668xl3z5vm5xprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s56d5rp',
      'addr_test1qxhwvnzxy65yd9rztc9hm4wq4mjn8f63umffj7wzpmce3s7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s3zxlw9',
      'addr_test1q9m4ua4nswv46cn7m2usqzv86kt30ku5mz3cfvsqfeg6luxprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9smhsrt2',
      'addr_test1q9sqz5z6xy2kmcma00ks9w04qspepat5qw0n3ve4y5wxeuwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9s2d2pz2',
      'addr_test1q9jmtp74vmg73nu3n0jj2r9nwf5pwckk3uhtfwqzqxkpvekprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9srcs4xc',
      'addr_test1qxszt0hfp387c3zhwx0yfkzmpqdm84emtdmlv48542kdehwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9ssarq2e',
      'addr_test1q9w7ny6vwjytzz5yyg0rzv9pde8qwhns66c9jkhxh26v2ywprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9shymkjl',
      'addr_test1q8fezaq8fl35j8rcnvk8szu6kwq47cmjmslyvregfuywh97prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9swyfxdh',
      'addr_test1qym37v8g7e3m8cl4w86uyck20h9ytsxcqedc3hj33pft6fwprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sy3xv9l',
      'addr_test1q9lmjl74935s9xh47cmqyf6ly8yul8rtz9t2cuxc9lc5uewprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sy3g0an',
      'addr_test1qxgy0j8t99vf894lpm2hunwh9cszmunzel4qj5zk7snm57kprmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9slpykq3',
      'addr_test1q8ft85wfghg46u5mnzahp797pza3heu7mdjj8q9rxrd8v67prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9sqgz7v7',
      'addr_test1q87squraxa3a5v0zyv8wf8g5vwmx5pcxje02fd09gjx42v7prmcgc38nvy9hu4k5dcyxhyqcdsfwnf50q5sm03x89e9slatf0d',
    ],
    addressGenerator: {
      accountPubKeyHex:
        '6c2311e6e7a934751c55054cb21ab844f2e55baa48fc8f298dd54430f116d1c14c5f12d15611670454e05efac74e8f5d5e887ae2c15ef3086e0691d0d8439665',
      walletImplementationId: 'haskell-shelley',
      type: 'External',
    },
  },
  isHW: false,
  hwDeviceInfo: null,
  isReadOnly: false,
}

const getBech32InternalChain = (wallet: any) => wallet.internalChain?._addressGenerator._accountPubKeyPtr?.toBech32()
const getRewardAddress = (wallet: any) =>
  wallet.getRewardAddress().then((address: Address) => address.toBech32(undefined))
const getWalletData = (wallet: YoroiWallet) => rootStorage.join(`${wallet.id}/`).getItem(`data`)
const getStakingKey = (wallet: YoroiWallet) => wallet.getStakingKey().then((key) => key.toBech32())
