// @flow
import jestSetup from '../jestSetup'

import {
  getMasterKeyFromMnemonic,
  getAccountFromMasterKey,
  getExternalAddresses,
  getAddressInHex,
  isValidAddress,
  discoverAddresses,
} from './util'

import {CARDANO_CONFIG} from '../config'

jestSetup.setup()

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

  const discover = (gapLimit, batchSize) => discoverAddresses({
    account,
    type: 'External',
    highestUsedIndex: -1,
    startIndex: 0,
    filterUsedAddressesFn: filterUsed,
    gapLimit,
    batchSize,
  })

  expect.assertions(5)
  // -1] [# 1] [...]
  const result1 = await discover(1, 2)
  expect(result1.addresses.length).toBe(2)

  // -1] [# 1 # 3 4] [5 6 # 8 9]
  const result2 = await discover(2, 5)
  expect(result2.addresses.length).toBe(5)

  // -1] [# 1 # 3 4] [5 6 # 8 9] [10 11 12 13 #] [15 16 17 18 19]
  const result3 = await discover(3, 5)
  expect(result3.addresses.length).toBe(20)

  // -1] [# 1 # 3 4 5 6 # 8 9] [10 11 12 13 # 15 16 17 18 19]
  const result4 = await discover(5, 10)
  expect(result4.addresses.length).toBe(20)

  // check if batchSize < gapSize works
  // -1] [#] [1] [#] [3] [4] [5] [6] [#] [8] [9] [10] [11] [12]
  const result5 = await discover(5, 1)
  // TODO(ppershing): figure out why this results in 13 and not 12
  expect(result5.addresses.length).toBe(13)
})
