// @flow
/* eslint-env jest */
import jestSetup from '../jestSetup'

import _ from 'lodash'

import {WalletManager} from './wallet'

jestSetup.setup()
// We do a lot of API calls for sync tests
jest.setTimeout(15 * 1000)

// eslint-disable-next-line max-len
const mnemonic =
  'dry balcony arctic what garbage sort' +
  ' cart shine egg lamp manual bottom' +
  ' slide assault bus'

test('Can restore wallet', async () => {
  expect.assertions(2)
  const walletManager = new WalletManager()
  await walletManager.restoreWallet(mnemonic, '')
  await walletManager.doFullSync()
  // Note(ppershing): these are just loose tests because we are testing
  // agains live test-wallet and so the numbers might increase over time
  expect(walletManager.internalChain._addresses.length).toBeGreaterThanOrEqual(
    27,
  )
  expect(walletManager.externalChain._addresses.length).toBeGreaterThanOrEqual(
    60,
  )
})

test('Can sync txs after restoring wallet', async () => {
  expect.assertions(1)
  const walletManager = new WalletManager()
  await walletManager.restoreWallet(mnemonic, '')

  await walletManager.doFullSync()

  // Note(ppershing): these are just loose tests because we are testing
  // agains live test-wallet and so the numbers might increase over time
  expect(_.size(walletManager.transactions)).toBeGreaterThanOrEqual(13)
})
