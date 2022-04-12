import {CONFIG} from '../../../legacy/config'
import {getCardanoByronConfig} from '../../../legacy/networks'
import {getAccountFromMasterKey, getAddressInHex, getExternalAddresses, getMasterKeyFromMnemonic} from './util'

const BYRON_PROTOCOL_MAGIC = getCardanoByronConfig().PROTOCOL_MAGIC

const mnemonic = [
  'dry balcony arctic what garbage sort',
  'cart shine egg lamp manual bottom',
  'slide assault bus',
].join(' ')

const externalAddresses = [
  'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ7',
  'Ae2tdPwUPEZ8wGxWm9VbZXFJcgLeKQJWKqREVEtHXYdqsqc4bLeGqjSwrtu',
]

// getExternalAddresses
test('Can generate external addresses', async () => {
  expect.assertions(1)

  const masterKey = await getMasterKeyFromMnemonic(mnemonic)
  const account = await getAccountFromMasterKey(masterKey, CONFIG.NUMBERS.ACCOUNT_INDEX)
  const addresses = await getExternalAddresses(account, [0, 1], BYRON_PROTOCOL_MAGIC)

  expect(addresses).toEqual(externalAddresses)
})

// getAddressInHex
test('Can convert address to hex', () => {
  const address = externalAddresses[0]
  const hex = '82d818582183581ce0256c34965ce528570c22f88073e625020288a1973c1e2d466d39bca0001ab7e3a79a'

  expect(getAddressInHex(address)).toEqual(hex)
})

test('Throws error when converting bad address', () => {
  expect(() => getAddressInHex('&*')).toThrow()
})

test('Make sure that we are using safe buffers', () => {
  // in response to https://github.com/nodejs/node/issues/4660
  expect(new Buffer(10).toString('hex')).toBe('00000000000000000000')
})
