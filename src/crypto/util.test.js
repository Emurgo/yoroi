// @flow

import {
  getMasterKeyFromMnemonic,
  getAccountFromMasterKey,
  getExternalAddresses,
} from './util'

import {CARDANO_CONFIG} from '../config'

// eslint-disable-next-line max-len
const mnemonic = 'dry balcony arctic what garbage sort cart shine egg lamp manual bottom slide assault bus'

const externalAddresses = [
  'Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ7',
  'Ae2tdPwUPEZ8wGxWm9VbZXFJcgLeKQJWKqREVEtHXYdqsqc4bLeGqjSwrtu',
  'Ae2tdPwUPEZ6T9qZxpao8ciAgg6ahjHRq2jV45ndZ4oPXAwrTYqN9NGUPh4',
]


test('Can generate externall addresses', () => {
  const masterKey = getMasterKeyFromMnemonic(mnemonic)
  const account = getAccountFromMasterKey(masterKey, CARDANO_CONFIG.TESTNET.PROTOCOL_MAGIC)
  const addresses = getExternalAddresses(account, [0, 1, 2])

  expect(addresses).toEqual(externalAddresses)
})
