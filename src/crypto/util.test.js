// @flow
import jestSetup from '../jestSetup'

import {
  getMasterKeyFromMnemonic,
  getAccountFromMasterKey,
  getExternalAddresses,
  getAddressInHex,
  isValidAddress,
  encryptMasterKey,
  decryptMasterKey,
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
  const encryptedKey = await encryptMasterKey(masterKey, 'password')
  const decryptedKey = await decryptMasterKey(encryptedKey, 'password')

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
  const wallet = {
    derivation_scheme: 'V2',
    selection_policy: 'FirstMatchFirst',
    config: {protocol_magic: 764824073},
    root_cached_key:
      '10be4df444be48af3ea3310e45e38a4d53c82400db7a3b91e1a868994db7354d' +
      'e05b7bdfda74bee59f69319aa0b7dd361ddd2e99a6749c123f6872de79bb50bd' +
      '0cb6c81ecc17963e2e8eb81abf86ca3e7921d44c1992a32493b1a25e6f55e5dd',
  }
  const inputs = [
    {
      ptr: {
        id: 'db0306050897ce24c69c8995930b685af8babcd4397e69c19fd2557d5bbe1b61',
        index: 1,
      },
      value: {
        address: 'Ae2tdPwUPEZMLUshHiXxqkFfnWxEyZ3fbvfdSd5rRyUpPnib2VnT7VTq7T7',
        value: '13088618',
      },
      addressing: {account: 0, change: 1, index: 9},
    },
    {
      ptr: {
        id: '03d108eb14ce04e6fac604e527daf47880823d7786239783ff0f3d8169e194d7',
        index: 0,
      },
      value: {
        address: 'Ae2tdPwUPEZAghGCdQykbGxc991wdoA8bXmSn7eCGuUKXF4EsRhWj4PJitn',
        value: '200000',
      },
      addressing: {account: 0, change: 0, index: 0},
    },
    {
      ptr: {
        id: '6ef8bcb181fad5eb18da415dc176c89156cf6d65604fc11121362af49e029113',
        index: 0,
      },
      value: {
        address: 'Ae2tdPwUPEZAghGCdQykbGxc991wdoA8bXmSn7eCGuUKXF4EsRhWj4PJitn',
        value: '1000000',
      },
      addressing: {account: 0, change: 0, index: 0},
    },
    {
      ptr: {
        id: 'db0306050897ce24c69c8995930b685af8babcd4397e69c19fd2557d5bbe1b61',
        index: 0,
      },
      value: {
        address: 'Ae2tdPwUPEZAghGCdQykbGxc991wdoA8bXmSn7eCGuUKXF4EsRhWj4PJitn',
        value: '1000000',
      },
      addressing: {account: 0, change: 0, index: 0},
    },
  ]

  it('can sign small amount', async () => {
    expect.assertions(1)

    const outputs = [
      {
        address: 'Ae2tdPwUPEZAghGCdQykbGxc991wdoA8bXmSn7eCGuUKXF4EsRhWj4PJitn',
        value: '100',
      },
    ]

    const change = 'Ae2tdPwUPEZJcamJUVWxJEwR8rj5x74t3FkUFDzKEdoL8YSyeRdwmJCW9c3'
    const tx = await signTransaction(wallet, inputs, outputs, change)
    expect(tx).not.toBeNull()
  })

  it('can sign large amount', async () => {
    expect.assertions(1)

    const outputs = [
      {
        address: 'Ae2tdPwUPEZAghGCdQykbGxc991wdoA8bXmSn7eCGuUKXF4EsRhWj4PJitn',
        value: '15097900',
      },
    ]

    const change = 'Ae2tdPwUPEZJcamJUVWxJEwR8rj5x74t3FkUFDzKEdoL8YSyeRdwmJCW9c3'
    const tx = await signTransaction(wallet, inputs, outputs, change)
    expect(tx).not.toBeNull()
  })

  it('can sign even larger amount', async () => {
    expect.assertions(1)
    const outputs = [
      {
        address: 'Ae2tdPwUPEZAghGCdQykbGxc991wdoA8bXmSn7eCGuUKXF4EsRhWj4PJitn',
        value: '15098915',
      },
    ]

    const change = 'Ae2tdPwUPEZJcamJUVWxJEwR8rj5x74t3FkUFDzKEdoL8YSyeRdwmJCW9c3'
    const tx = await signTransaction(wallet, inputs, outputs, change)
    expect(tx).not.toBeNull()
  })

  it('throws InsuffiecientFunds', async () => {
    expect.assertions(1)
    const outputs = [
      {
        address: 'Ae2tdPwUPEZAghGCdQykbGxc991wdoA8bXmSn7eCGuUKXF4EsRhWj4PJitn',
        value: '25000000',
      },
    ]

    const change = 'Ae2tdPwUPEZJcamJUVWxJEwR8rj5x74t3FkUFDzKEdoL8YSyeRdwmJCW9c3'
    const promise = signTransaction(wallet, inputs, outputs, change)
    await expect(promise).rejects.toBeInstanceOf(InsufficientFunds)
  })

  // Note(ppershing): This is a known bug in rust-cardano implementation
  // and we can do nothing with it
  // Let's hope this test fails (with correct behavior) in the future
  it('can handle rust bug', async () => {
    expect.assertions(1)
    const outputs = [
      {
        address: 'Ae2tdPwUPEZAghGCdQykbGxc991wdoA8bXmSn7eCGuUKXF4EsRhWj4PJitn',
        value: '15096900',
      },
    ]

    const change = 'Ae2tdPwUPEZJcamJUVWxJEwR8rj5x74t3FkUFDzKEdoL8YSyeRdwmJCW9c3'
    const promise = signTransaction(wallet, inputs, outputs, change)

    // expect(await promise).not.toBeNull()
    await expect(promise).rejects.toBeInstanceOf(InsufficientFunds)
  })
})
