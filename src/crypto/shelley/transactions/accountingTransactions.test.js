// @flow

import jestSetup from '../../../jestSetup'

import {BigNumber} from 'bignumber.js'
import {Address, PrivateKey} from 'react-native-chain-libs'
import {buildUnsignedAccountTx, signTransaction} from './accountingTransactions'
import {getTxInputTotal, getTxOutputTotal} from './utils'
import {InsufficientFunds} from '../../errors'

jestSetup.setup()

const addressStr =
  'ca1qw8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqeh83d4'

// just a simple test to check if chain-libs has been correctly loaded
test('can create an address object from an address string', async () => {
  const address = await Address.from_string(addressStr)
  const exportedAddress = await address.to_string('ca')
  expect(exportedAddress).toEqual(addressStr)
  address.free()
})

describe('Create unsigned TX for account', () => {
  it('Should create a valid transaction', async () => {
    const senderKey = await PrivateKey.from_bech32(
      'ed25519_sk1ahfetf02qwwg4dkq7mgp4a25lx5vh9920cr5wnxmpzz9906qvm8qwvlts0',
    )

    const unsignedTxResponse = await buildUnsignedAccountTx(
      await senderKey.to_public(),
      Buffer.from(
        await (await Address.from_string(
          'ca1qw8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqeh83d4',
        )).as_bytes(),
      ).toString('hex'),
      {
        amount: new BigNumber(2000000),
      },
      new BigNumber(5000000),
    )

    const inputSum = await getTxInputTotal(unsignedTxResponse, false)
    const outputSum = await getTxOutputTotal(unsignedTxResponse, false)
    expect(inputSum.toString()).toEqual('2155383')
    expect(outputSum.toString()).toEqual('2000000')
    expect(inputSum.minus(outputSum).toString()).toEqual('155383')

    const fragment = await signTransaction(
      unsignedTxResponse,
      0,
      undefined,
      senderKey,
    )

    const signedTx = await fragment.get_transaction()
    const witnesses = await signedTx.witnesses()

    expect(await witnesses.size()).toEqual(1)
    expect(await (await witnesses.get(0)).to_bech32()).toEqual(
      // eslint-disable-next-line max-len
      'witness1qfmmw476z0hd33wfx32p0qkn3xc7j42h0gr37z3vgq9aanzn3v6vm93j7wzpdea3qg440a4vwtdta0vf7mv5vd2d96s2xjw8urj73dc93jsax4',
    )
    // eslint-disable-next-line max-len
    expect(
      Buffer.from(await (await fragment.id()).as_bytes()).toString('hex'),
    ).toEqual(
      'bea8a66eceb975ffd2ec5647b9554b59789aee2f0a09cb025007895cff3e9343',
    )
    // eslint-disable-next-line max-len
    expect(
      Buffer.from(
        await (await (await fragment.get_transaction()).id()).as_bytes(),
      ).toString('hex'),
    ).toEqual(
      'e7d62806bb7cddc74d8ae8ad99eae408f9a13c32ecd1fc8d5a2ea853832f78ee',
    )
    signedTx.free()
  })

  it('Should fail due to insufficient funds (not enough to cover fees)', async () => {
    const senderKey = await PrivateKey.from_bech32(
      'ed25519_sk1ahfetf02qwwg4dkq7mgp4a25lx5vh9920cr5wnxmpzz9906qvm8qwvlts0',
    )
    const promise = buildUnsignedAccountTx(
      await senderKey.to_public(),
      Buffer.from(
        await (await Address.from_string(
          'ca1qw8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqeh83d4',
        )).as_bytes(),
      ).toString('hex'),
      {
        amount: new BigNumber(2000000),
      },
      new BigNumber(2000000),
    )
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })

  it('Should fail due to insufficient funds (not enough to cover amount)', async () => {
    const senderKey = await PrivateKey.from_bech32(
      'ed25519_sk1ahfetf02qwwg4dkq7mgp4a25lx5vh9920cr5wnxmpzz9906qvm8qwvlts0',
    )
    const promise = buildUnsignedAccountTx(
      await senderKey.to_public(),
      Buffer.from(
        await (await Address.from_string(
          'ca1qw8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqeh83d4',
        )).as_bytes(),
      ).toString('hex'),
      {
        amount: new BigNumber(2000000),
      },
      new BigNumber(1000000),
    )
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })
})
