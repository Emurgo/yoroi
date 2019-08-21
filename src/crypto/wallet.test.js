// @flow
/* eslint-env jest */
import jestSetup from '../jestSetup'

jestSetup.setup()
// We do a lot of API calls for sync tests
jest.setTimeout(30 * 1000)

// We have to mock config before importing wallet so it propagates in it
jest.setMock('react-native-config', {USE_TESTNET: true})
const walletWithTestnet = require('./wallet')

// eslint-disable-next-line max-len
const mnemonic = [
  'panic advice priority develop',
  'solid remind ankle shock',
  'include oyster profit reopen',
  'acid pole crisp',
].join(' ')

test('Can restore wallet', async () => {
  expect.assertions(2)
  const wallet = new walletWithTestnet.Wallet()
  await wallet._create(mnemonic, 'password')
  await wallet.doFullSync()
  // Note(ppershing): these are just loose tests because we are testing
  // agains live test-wallet and so the numbers might increase over time
  expect(wallet._internalChain.size()).toBeGreaterThanOrEqual(50)
  expect(wallet._externalChain.size()).toBeGreaterThanOrEqual(50)
})

// TODO: add more txs
const expectedTxs = [
  'ed9d06931a7a1356bae2a1073b4105e2cf47cccbf769b0be921b01a82e902e51',
  '63cc42fc5413675ae459dbec7b6151b916570cc41da638459c5486fc1c6d95b4',
]

test('Can sync txs after restoring wallet', async () => {
  expect.assertions(expectedTxs.length)
  const wallet = new walletWithTestnet.Wallet()
  await wallet._create(mnemonic, 'password')

  await wallet.doFullSync()

  // Note(ppershing): these are just loose tests because we are testing
  // agains live test-wallet and so the numbers might increase over time
  // expect(_.size(txs)).toBeGreaterThanOrEqual(43)

  expectedTxs.forEach((etx) => {
    expect(wallet.transactions).toHaveProperty(etx)
  })
})
