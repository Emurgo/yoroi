// @flow
import jestSetup from '../jestSetup'

import moment from 'moment'

import {
  getMasterKeyFromMnemonic,
  getAccountFromMasterKey,
  getExternalAddresses,
  getAddressInHex,
  isValidAddress,
  encryptData,
  decryptData,
  formatBIP44,
  signTransaction,
} from './util'

import {InsufficientFunds} from './errors'

import longAddress from './__fixtures/long_address.json'

import {CARDANO_CONFIG, CONFIG} from '../config'

jestSetup.setup()

const mnemonic = [
  'dry balcony arctic what garbage sort',
  'cart shine egg lamp manual bottom',
  'slide assault bus',
].join(' ')

const externalAddresses = [
  'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ7',
  'Ae2tdPwUPEZ8wGxWm9VbZXFJcgLeKQJWKqREVEtHXYdqsqc4bLeGqjSwrtu',
  'Ae2tdPwUPEZ6T9qZxpao8ciAgg6ahjHRq2jV45ndZ4oPXAwrTYqN9NGUPh4',
]

// getExternalAddresses
test('Can generate external addresses', async () => {
  expect.assertions(1)

  const masterKey = await getMasterKeyFromMnemonic(mnemonic)
  const account = await getAccountFromMasterKey(
    masterKey,
    CONFIG.WALLET.ACCOUNT_INDEX,
    CARDANO_CONFIG.TESTNET.PROTOCOL_MAGIC,
  )
  const addresses = await getExternalAddresses(account, [0, 1, 2])

  expect(addresses).toEqual(externalAddresses)
})

// getAddressInHex
test('Can convert address to hex', () => {
  const address = externalAddresses[0]
  // prettier-ignore
  // eslint-disable-next-line max-len
  const hex = '82d818582183581ce0256c34965ce528570c22f88073e625020288a1973c1e2d466d39bca0001ab7e3a79a'
  expect(getAddressInHex(address)).toEqual(hex)
})

test('Throws error when converting bad address', () => {
  expect(() => getAddressInHex('&*')).toThrow()
})

// isValidAddress
test('Can validate valid addresses', async () => {
  expect.assertions(externalAddresses.length)
  for (const address of externalAddresses) {
    const isValid = await isValidAddress(address)
    expect(isValid).toBe(true)
  }
})

// isValidAddress
test('Can validate long address', async () => {
  expect.assertions(1)
  const isValid = await isValidAddress(longAddress)
  expect(isValid).toBe(true)
})

test('Can validate invalid addresses', async () => {
  const addresses = [
    // should be invalid
    'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ6',
    'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ', // too short
    'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ77', // too long
    '',
    'bad',
    'badChars&*/',
    '1234',
  ]
  expect.assertions(addresses.length)
  for (const address of addresses) {
    const isValid = await isValidAddress(address)
    expect(isValid).toBe(false)
  }
})

test('Can encrypt / decrypt masterKey', async () => {
  expect.assertions(1)
  const masterKey = await getMasterKeyFromMnemonic(mnemonic)
  const encryptedKey = await encryptData(masterKey, 'password')
  const decryptedKey = await decryptData(encryptedKey, 'password')

  expect(masterKey).toEqual(decryptedKey)
})

test('Make sure that we are using safe buffers', () => {
  // in response to https://github.com/nodejs/node/issues/4660
  expect(new Buffer(10).toString('hex')).toBe('00000000000000000000')
})

test('Can format address', () => {
  expect(formatBIP44(42, 'Internal', 47)).toBe("m/44'/1815'/42'/1/47")
})

describe('signTransaction', () => {
  const wallet = require('./__fixtures/fake_wallet.json')
  const inputs = require('./__fixtures/transaction_inputs.json')
  const outputAddress =
    'Ae2tdPwUPEZAghGCdQykbGxc991wdoA8bXmSn7eCGuUKXF4EsRhWj4PJitn'
  const change = 'Ae2tdPwUPEZJcamJUVWxJEwR8rj5x74t3FkUFDzKEdoL8YSyeRdwmJCW9c3'

  it('can sign small amount', async () => {
    expect.assertions(1)

    const outputs = [
      {
        address: outputAddress,
        value: '100',
      },
    ]

    const tx = await signTransaction(wallet, inputs, outputs, change)
    expect(tx).not.toBeNull()
  })

  it('can sign large amount', async () => {
    expect.assertions(1)

    const outputs = [
      {
        address: outputAddress,
        value: '15097900',
      },
    ]

    const tx = await signTransaction(wallet, inputs, outputs, change)
    expect(tx).not.toBeNull()
  })

  it('can sign even larger amount', async () => {
    expect.assertions(1)
    const outputs = [
      {
        address: outputAddress,
        value: '15098915',
      },
    ]

    const tx = await signTransaction(wallet, inputs, outputs, change)
    expect(tx).not.toBeNull()
  })

  it('throws InsuffiecientFunds', async () => {
    expect.assertions(1)
    const outputs = [
      {
        address: outputAddress,
        value: '25000000',
      },
    ]

    const promise = signTransaction(wallet, inputs, outputs, change)
    await expect(promise).rejects.toBeInstanceOf(InsufficientFunds)
  })

  // Note(ppershing): This is a known bug in rust-cardano implementation
  // and we can do nothing with it
  // Let's hope this test fails (with correct behavior) in the future
  it('can handle rust bug', async () => {
    expect.assertions(2)
    // Upstream should have been fixed by now
    expect(moment().isBefore('2019-06-01')).toBeTruthy()

    const outputs = [
      {
        address: outputAddress,
        value: '15096900',
      },
    ]

    const promise = signTransaction(wallet, inputs, outputs, change)
    // Correct behavior:
    // expect(await promise).not.toBeNull()
    await expect(promise).rejects.toBeInstanceOf(InsufficientFunds)
  })

  it('can handle big amounts', async () => {
    expect.assertions(1)
    const outputs = [
      {
        address: outputAddress,
        value: '11111111111111000000',
      },
    ]

    const promise = signTransaction(wallet, inputs, outputs, change)
    await expect(promise).rejects.toBeInstanceOf(InsufficientFunds)
  })

  it('can handle insanely huge amounts', async () => {
    expect.assertions(1)
    const outputs = [
      {
        address: outputAddress,
        value: '1234567891234567890123456789000000',
      },
    ]

    const promise = signTransaction(wallet, inputs, outputs, change)
    await expect(promise).rejects.toBeInstanceOf(InsufficientFunds)
  })

  it('can handle multiple big amounts', async () => {
    expect.assertions(1)
    const outputs = [
      {
        address: outputAddress,
        value: '44000000000000000',
      },
      {
        address: outputAddress,
        value: '44000000000000000',
      },
    ]

    const promise = signTransaction(wallet, inputs, outputs, change)
    await expect(promise).rejects.toBeInstanceOf(InsufficientFunds)
  })
})
