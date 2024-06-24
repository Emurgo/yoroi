import {mocks} from '../../mocks'
import {getMasterKeyFromMnemonic} from '../mnemonic/mnemonic'
import {cip95ExtensionMaker} from './cip95'

describe('cip95ExtensionMaker', () => {
  it('should support signData', async () => {
    const rootKey = await getMasterKeyFromMnemonic(mnemonic)
    const message = 'whatever'
    const addressBech32 =
      'addr1qynqc23tpx4dqps6xgqy9s2l3xz5fxu734wwmzj9uddn0h2z6epfcukqmswgwwfruxh7gaddv9x0d5awccwahnhwleqqc4zkh4'

    const cip95 = cip95ExtensionMaker(mocks.wallet, mocks.walletMeta)
    const result = await cip95.signData(rootKey, addressBech32, message)

    expect(result).toEqual({
      signature:
        '845846a201276761646472657373583901260c2a2b09aad0061a320042c15f8985449b9e8d5ced8a45e35b37dd42d6429c72c0dc1c873923e1afe475ad614cf6d3aec61ddbceeefe40a166686173686564f448776861746576657258406a16fcb9cc6c3f7d83fdd623e8896d4b81c0ef6a9fb68d916794e2e4c3c0766666b485f71c6f1f56241cb30905cc18618c7e95721dba3e91bcd9918f51e8b90a',
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
