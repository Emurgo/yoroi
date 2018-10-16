// @flow

import {
  getMasterKeyFromMnemonic,
  getAccountFromMasterKey,
  getExternalAddresses,
  getAddressInHex,
  isValidAddress,
  discoverAddresses,
} from './util'

import {CARDANO_CONFIG} from '../config'

// eslint-disable-next-line max-len
const mnemonic = 'dry balcony arctic what garbage sort cart shine egg lamp manual bottom slide assault bus'

const externalAddresses = [
  'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ7',
  'Ae2tdPwUPEZ8wGxWm9VbZXFJcgLeKQJWKqREVEtHXYdqsqc4bLeGqjSwrtu',
  'Ae2tdPwUPEZ6T9qZxpao8ciAgg6ahjHRq2jV45ndZ4oPXAwrTYqN9NGUPh4',
]

// getExternalAddresses
test('Can generate external addresses', () => {
  const masterKey = getMasterKeyFromMnemonic(mnemonic)
  const account = getAccountFromMasterKey(masterKey, CARDANO_CONFIG.TESTNET.PROTOCOL_MAGIC)
  const addresses = getExternalAddresses(account, [0, 1, 2])

  expect(addresses).toEqual(externalAddresses)
})

// getAddressInHex
test('Can convert address to hex', () => {
  const address = externalAddresses[0]
  // eslint-disable-next-line max-len
  const hex = '82d818582183581ce0256c34965ce528570c22f88073e625020288a1973c1e2d466d39bca0001ab7e3a79a'
  expect(getAddressInHex(address)).toEqual(hex)
})

test('Throws error when converting bad address', () => {
  expect(() => getAddressInHex('&*')).toThrow()
})

// isValidAddress
test('Can validate valid addresses', () => {
  externalAddresses.forEach((address) => expect(isValidAddress(address)).toBe(true))
})

test('Can validate invalid addresses', () => {
  const addresses = [
    'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ6', // should be invalid
    'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ', // too short
    'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ77', // too long
    '',
    'bad',
    'badChars&*/',
    '1234',
  ]
  addresses.forEach((address) => expect(isValidAddress(address)).toBe(false))
})


test('Can discover addresses', async () => {
  const masterKey = getMasterKeyFromMnemonic(mnemonic)
  const account = getAccountFromMasterKey(masterKey, CARDANO_CONFIG.TESTNET.PROTOCOL_MAGIC)
  const used = getExternalAddresses(account, [0, 2, 7, 14, 21, 28, 35, 40, 45, 50, 55, 60])

  const filterUsed = (addresses) => Promise.resolve(addresses.filter((addr) => used.includes(addr)))
  expect.assertions(3)

  const result1 = await discoverAddresses(account, 'External', -1, filterUsed, 1, 2)
  await expect(result1.addresses.length).toBe(3)

  // Note(ppershing): this demonstrates that the gap can be quite
  // big in some cases, 7->14 is gap 7
  const result2 = await discoverAddresses(account, 'External', -1, filterUsed, 2, 5)
  await expect(result2.addresses.length).toBe(16)

  const result3 = await discoverAddresses(account, 'External', -1, filterUsed, 2, 10)
  await expect(result3.addresses.length).toBe(62)
})
