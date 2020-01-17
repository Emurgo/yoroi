// @flow
import jestSetup from '../../jestSetup'

import {
  generateWalletRootKey,
  getGroupAddresses,
  // getFirstInternalAddr,
  getGroupAddressesFromMnemonics,
} from './util'
import {getMasterKeyFromMnemonic} from '../byron/util'
import {NUMBERS} from '../../config'

jestSetup.setup()

const mnemonic = [
  'panic advice priority develop',
  'solid remind ankle shock',
  'include oyster profit reopen',
  'acid pole crisp',
].join(' ')

test('Can create master key', async () => {
  const masterKeyV2 = await getMasterKeyFromMnemonic(mnemonic)
  const masterKeyV3 = await generateWalletRootKey(mnemonic)
  expect(masterKeyV2).toEqual(
    Buffer.from(await masterKeyV3.as_bytes()).toString('hex'),
  )
})

describe('group addresses', () => {
  it('can generate group addresses from mnemonics', async () => {
    const groupAddr = await getGroupAddressesFromMnemonics(
      mnemonic,
      'External',
      [0, 1],
    )
    expect(groupAddr[0]).toEqual(
      // eslint-disable-next-line max-len
      'addr1s3utl8uysq33ja08f6wkvkdw3v2a6x3esvk5v3w0dsaa95j48cgutakry32dnqxjc5v3m052celqqrpyfl8y7326zc4qs823pstg28kgu3e8lp',
    )
    expect(groupAddr[1]).toEqual(
      // eslint-disable-next-line max-len
      'addr1s33elx8s47nftgsmm7ngy3n6u96nszx88msxlmf235u8csxr24w6lakry32dnqxjc5v3m052celqqrpyfl8y7326zc4qs823pstg28kgzdzy90',
    )
  })

  it('can generate several group addresses', async () => {
    const accountKey = await (await (await (await generateWalletRootKey(
      mnemonic,
    )).derive(NUMBERS.WALLET_TYPE_PURPOSE.CIP1852)).derive(
      NUMBERS.COIN_TYPES.CARDANO,
    )).derive(0 + NUMBERS.HARD_DERIVATION_START)
    const stakingKey = await (await (await (await accountKey.derive(
      NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
    )).derive(NUMBERS.STAKING_KEY_INDEX)).to_public()).to_raw_key()
    const accountPublic = await accountKey.to_public()
    const chainKey = await accountPublic.derive(0)
    const addresses = await getGroupAddresses(chainKey, stakingKey, [
      0,
      1,
      2,
      3,
      4,
    ])
    expect(addresses).toHaveLength(5)
  })
})
