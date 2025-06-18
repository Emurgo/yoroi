import {mocks} from '../../mocks/wallet'
import {getMasterKeyFromMnemonic} from '../mnemonic/mnemonic'
import {cip95ExtensionMaker} from './cip95'

describe('cip95ExtensionMaker', () => {
  it('should throw an error for unsupported wallet implementation', async () => {
    expect(() => cip95ExtensionMaker(mocks.wallet, {...mocks.walletMeta, implementation: 'cardano-bip44'})).toThrow()
  })

  it('should support signData', async () => {
    const rootKey = await getMasterKeyFromMnemonic(mnemonic)
    const message = '48656C6C6F'
    const addressBech32 =
      'addr1qynqc23tpx4dqps6xgqy9s2l3xz5fxu734wwmzj9uddn0h2z6epfcukqmswgwwfruxh7gaddv9x0d5awccwahnhwleqqc4zkh4'

    const cip95 = cip95ExtensionMaker(mocks.wallet, mocks.walletMeta)
    const result = await cip95.signData(rootKey, addressBech32, message)

    expect(result).toEqual({
      signature:
        '845846a201276761646472657373583901260c2a2b09aad0061a320042c15f8985449b9e8d5ced8a45e35b37dd42d6429c72c0dc1c873923e1afe475ad614cf6d3aec61ddbceeefe40a166686173686564f44548656c6c6f58400b6a6aac7a95656ab241bf4dedec8b5ca0d4893747093f3382223b1d2e869de1b6b9809f0b974536b1191b6e193cf4ec5dc506b21b52e6bc5d352f04c60bf30d',
      key: 'a4010103272006215820be6a4d7e9789dd7458049c971ad783107e7f041c6f1f542b4530d63d5fe5afb1',
    })
  })

  it('should support getRegisteredPubStakeKeys', async () => {
    const registeredResult = await cip95ExtensionMaker(
      {...mocks.wallet, getStakingInfo: () => Promise.resolve({status: 'registered'})},
      mocks.walletMeta,
    ).getRegisteredPubStakeKeys()

    expect(registeredResult).toEqual(['01c01f8b958699ae769a246e9785db5a70e023977ea4b856dfacf23c23346caf'])

    const stakedResult = await cip95ExtensionMaker(
      {
        ...mocks.wallet,
        getStakingInfo: () => Promise.resolve({status: 'staked', amount: '10', poolId: 'pool1', rewards: '10'}),
      },
      mocks.walletMeta,
    ).getRegisteredPubStakeKeys()

    expect(stakedResult).toEqual(['01c01f8b958699ae769a246e9785db5a70e023977ea4b856dfacf23c23346caf'])

    const notRegisteredResult = await cip95ExtensionMaker(
      {...mocks.wallet, getStakingInfo: () => Promise.resolve({status: 'not-registered'})},
      mocks.walletMeta,
    ).getRegisteredPubStakeKeys()

    expect(notRegisteredResult).toEqual([])
  })

  it('should support getUnregisteredPubStakeKeys', async () => {
    const registeredResult = await cip95ExtensionMaker(
      {...mocks.wallet, getStakingInfo: () => Promise.resolve({status: 'registered'})},
      mocks.walletMeta,
    ).getUnregisteredPubStakeKeys()

    expect(registeredResult).toEqual([])

    const stakedResult = await cip95ExtensionMaker(
      {
        ...mocks.wallet,
        getStakingInfo: () => Promise.resolve({status: 'staked', amount: '10', poolId: 'pool1', rewards: '10'}),
      },
      mocks.walletMeta,
    ).getUnregisteredPubStakeKeys()

    expect(stakedResult).toEqual([])

    const notRegisteredResult = await cip95ExtensionMaker(
      {...mocks.wallet, getStakingInfo: () => Promise.resolve({status: 'not-registered'})},
      mocks.walletMeta,
    ).getUnregisteredPubStakeKeys()

    expect(notRegisteredResult).toEqual(['01c01f8b958699ae769a246e9785db5a70e023977ea4b856dfacf23c23346caf'])
  })
})

const mnemonic = [
  'dry balcony arctic what garbage sort',
  'cart shine egg lamp manual bottom',
  'slide assault bus',
].join(' ')
