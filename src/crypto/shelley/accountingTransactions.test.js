// @flow
import jestSetup from '../../jestSetup'

import {BigNumber} from 'bignumber.js'
import {Address, PrivateKey} from 'react-native-chain-libs'
import {
  buildTransaction,
  signTransaction,
} from './accountingTransactions'
import {
  getTxInputTotal,
  getTxOutputTotal,
} from './utils'

jestSetup.setup()

const addressStr = 'ca1qw8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqeh83d4'

// just a simple test to check if chain-libs has been correctly loaded
test('can create an address object from an address string', async () => {
  const address = await Address.from_string(addressStr)
  const exportedAddress = await address.to_string('ca')
  expect(exportedAddress).toEqual(addressStr)
  address.free()
})

describe('Create unsigned TX for account', () => {
  it('Should create a valid transaction', async () => {
    const senderKey = PrivateKey.from_bech32(
      'ed25519_sk1ahfetf02qwwg4dkq7mgp4a25lx5vh9920cr5wnxmpzz9906qvm8qwvlts0'
    )

    const unsignedTxResponse = await buildTransaction(
      senderKey.to_public(),
      'ca1qw8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqeh83d4',
      new BigNumber(2000000),
      new BigNumber(5000000),
    )

    const inputSum = getTxInputTotal(unsignedTxResponse)
    const outputSum = getTxOutputTotal(unsignedTxResponse)
    expect(inputSum.toString()).toEqual('2155383')
    expect(outputSum.toString()).toEqual('2000000')
    expect(inputSum.minus(outputSum).toString()).toEqual('155383')

    const signedTx = await signTransaction(
      unsignedTxResponse,
      0,
      senderKey,
    )

    // AuthenticatedTransaction.witnesses() API is not yet available
    // const witnesses = signedTx.witnesses()
    //
    // expect(witnesses.size()).toEqual(1)
    // expect(witnesses.get(0).to_bech32()).toEqual(
    // eslint-disable-next-line max-len
    //   'witness1qfmmw476z0hd33wfx32p0qkn3xc7j42h0gr37z3vgq9aanzn3v6vm93j7wzpdea3qg440a4vwtdta0vf7mv5vd2d96s2xjw8urj73dc93jsax4'
    // )
    signedTx.free()
  })
})
