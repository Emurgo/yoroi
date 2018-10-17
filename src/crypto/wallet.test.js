// @flow
import '../jest'
import _ from 'lodash'

import walletManager from './wallet'

// eslint-disable-next-line max-len
const mnemonic = 'dry balcony arctic what garbage sort cart shine egg lamp manual bottom slide assault bus'

test('Can restore wallet', async () => {
  expect.assertions(2)
  await walletManager.restoreWallet(mnemonic)

  // Note(ppershing): these are just loose tests because we are testing
  // agains live test-wallet and so the numbers might increase over time
  expect(walletManager.internalAddresses.length).toBeGreaterThanOrEqual(27)
  expect(walletManager.externalAddresses.length).toBeGreaterThanOrEqual(60)
})


test('Can sync txs after restoring wallet', async () => {
  expect.assertions(1)
  await walletManager.restoreWallet(mnemonic)

  await walletManager.updateTxHistory()

  // Note(ppershing): these are just loose tests because we are testing
  // agains live test-wallet and so the numbers might increase over time
  expect(_.size(walletManager.transactions)).toBeGreaterThanOrEqual(13)

})
