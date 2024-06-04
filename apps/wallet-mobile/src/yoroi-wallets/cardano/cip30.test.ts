import {mocks} from '../mocks'
import {getMasterKeyFromMnemonic} from './byron/util'
import {cip30ExtensionMaker} from './cip30'
import {YoroiWallet} from './types'

describe('cip30ExtensionMaker', () => {
  it('should support submitTx', async () => {
    const mockWallet: YoroiWallet = {
      ...mocks.wallet,
      submitTransaction: jest.fn(),
    }

    const cip30 = cip30ExtensionMaker(mockWallet)
    const result = await cip30.submitTx(txCbor)
    expect(mockWallet.submitTransaction).toHaveBeenCalled()
    expect(result).toBe('1a6205dc7a5a0493ef64487ca7033d12ba8f85a7d4a6e62d3c8eaa570d74eb53')
  })

  it('should support getUtxos', async () => {
    const cip30 = cip30ExtensionMaker(mocks.wallet)
    const result = await cip30.getUtxos(undefined, undefined)
    expect(result).toHaveLength(mocks.wallet.utxos.length)
  })

  it('should support getBalance', async () => {
    const cip30 = cip30ExtensionMaker(mocks.wallet)
    const result = await cip30.getBalance()
    expect(result).toBeDefined()
    expect(await (await result.coin()).toStr()).toBe('2282543724')
  })

  it('should support getUnusedAddresses', async () => {
    const cip30 = cip30ExtensionMaker(mocks.wallet)
    const result = await cip30.getUnusedAddresses()
    expect(result).toEqual([])
  })

  it('should support getUsedAddresses', async () => {
    const cip30 = cip30ExtensionMaker(mocks.wallet)
    const result = await cip30.getUsedAddresses()
    expect(result).toEqual([])
  })

  it('should support getChangeAddress', async () => {
    const cip30 = cip30ExtensionMaker(mocks.wallet)
    const result = await cip30.getChangeAddress()
    const bech32 = await result.toBech32(undefined)
    const expectedAddress =
      'addr1qxy9yjhvxh700xeluhvdpwlauuvnzav42edveyggy8fusqvg2f9wcd0u77dnlewc6zalmecex96e24j6ejgssgwneqqs762af9'
    expect(bech32).toBe(expectedAddress)
  })

  it('should support getRewardAddresses', async () => {
    const cip30 = cip30ExtensionMaker({
      ...mocks.wallet,
      rewardAddressHex:
        '0188524aec35fcf79b3fe5d8d0bbfde719317595565acc910821d3c80188524aec35fcf79b3fe5d8d0bbfde719317595565acc910821d3c801',
    })
    const result = await cip30.getRewardAddresses()
    expect(result).toHaveLength(1)
    const [address] = result
    expect(await address.toBech32(undefined)).toBe(
      'addr1qxy9yjhvxh700xeluhvdpwlauuvnzav42edveyggy8fusqvg2f9wcd0u77dnlewc6zalmecex96e24j6ejgssgwneqqs762af9',
    )
  })

  it('should support getCollateral', async () => {
    const cip30 = cip30ExtensionMaker(mocks.wallet)
    const result = await cip30.getCollateral()
    expect(result).toHaveLength(1)
    const [utxo] = result ?? []
    expect(await utxo.toHex()).toBe(
      '8282582022d391c7a97559cb4784bd975214919618acce75cde573a7150a176700e761810282583900d0f356065392d8fd5a1021aa1f876110700aad101cf15b35a7c247b2c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e1a0053274d',
    )
  })

  it('should support signTx', async () => {
    const cip30 = cip30ExtensionMaker(mocks.wallet)
    const result = await cip30.signTx(await getMasterKeyFromMnemonic(mnemonic), txCbor, true)
    expect(result).toBeDefined()
  })
})

const mnemonic = [
  'dry balcony arctic what garbage sort',
  'cart shine egg lamp manual bottom',
  'slide assault bus',
].join(' ')

const txCbor =
  '84a30081825820ab67cc8cfc2904a49066255bbfb3893894e777387ff5389f01e86e3fdd91702900018282583901627e29d0e433daf833d8e80c97c575992cc3abadffd5ac2f64086b5dfd1c740673b5b8840a12cfbbd4e6c5c243bf08bbece4c8b3258194b21a001e848082583901fef19c26a68374e0d32be6b3870e611bf1d34d5e26e95ef2812008d1fd1c740673b5b8840a12cfbbd4e6c5c243bf08bbece4c8b3258194b2821a0761679ba4581c1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1ea150776f726c646d6f62696c65746f6b656e1a005ec5a8581c279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3fa144534e454b1901bc581c8654e8b350e298c80d2451beb5ed80fc9eee9f38ce6b039fb8706bc3a1474c4f42535445521a2d5448dd581ca0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235a145484f534b591a0203a048021a0002af65a0f5f6'