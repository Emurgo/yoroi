// @flow
/* eslint-env jest */
import jestSetup from '../jestSetup'
import {Wallet} from './wallet'
import {NETWORK_REGISTRY} from '../config/types'

jestSetup.setup()
// We do a lot of API calls for sync tests
jest.setTimeout(10 * 1000)

const mnemonic = [
  'dry balcony arctic what garbage sort',
  'cart shine egg lamp manual bottom',
  'slide assault bus',
].join(' ')

const networkId = NETWORK_REGISTRY.BYRON_MAINNET

test('Can restore wallet', async () => {
  expect.assertions(2)
  const wallet = new Wallet()
  await wallet._create(mnemonic, 'password', networkId)
  await wallet.doFullSync()
  // Note(ppershing): these are just loose tests because we are testing
  // agains live test-wallet and so the numbers might increase over time
  expect(wallet._internalChain.size()).toBeGreaterThanOrEqual(50)
  expect(wallet._externalChain.size()).toBeGreaterThanOrEqual(50)
})

const expectedTxs = [
  'e360c88cbbbad25db19a08c1278f0fc63416d668f5d5e7b17961ea716c103c14',
  '33379b40e10850088484287a07756c5336b8675b33e28a42f02c344971de2d98',
  '83a802a7cde8e2e30775d823598b11bf9365193b92effb804f2c59966dbb254f',
  '5c8ee7242b7c7eee497bdfd5ce64db609abc91a1804942789cc0e8a858c687a8',
  '13b03766fb998d9f1d6a9c666664444bf1efba1ab7dd38784d2b4151ab69bac3',
  '6d5952e620074259577a57e5ae641463f6c53f96f3624a80d7fae2d92f23c4a4',
  '31485feaae2ec6736d69a3ccd045dfff7e38d5a63b77cbf76c047de413d2f74d',
  '7a747b752e4aec3b1d618318eff510cd1dbc1a37cc12ea69ca9c5b7b09728713',
  '74e407b980d0bd191e940f96790773a566b6599840cf2027e957dd303fc94575',
  '9d3d7165920075bd26819549d5146adfb64f8190de5815d65b7dcf756a7004df',
  '2401257195a3cd7d43e832b2d2e8215828ebbcdea472ef81f8de3314a535813e',
  '9713c486981c294d064be96a37e4da07e399941205bddc789281bf7765638b8a',
  'f75517997da1b7bf8139db1d06cbba7fb3ce9c47c73c8dfcf204b0fc70424142',
  'b0361fa5efc00a29fb3fb8507ae59a9d81c810ab2d50c90c00d31f626650de52',
]

test('Can sync txs after restoring wallet', async () => {
  expect.assertions(expectedTxs.length)
  const wallet = new Wallet()
  await wallet._create(mnemonic, 'password', networkId)

  await wallet.doFullSync()

  expectedTxs.forEach((etx) => {
    expect(wallet.transactions).toHaveProperty(etx)
  })
})
