// @flow
/* eslint-disable max-len */

import jestSetup from '../../../jestSetup'

import {Bip32PrivateKey} from 'react-native-chain-libs'
import type {
  RawUtxo,
  AddressedUtxo,
  Addressing,
} from '../../../types/HistoryTransaction'
import {
  newAdaUnsignedTx,
  newAdaUnsignedTxFromUtxo,
  signTransaction,
  sendAllUnsignedTxFromUtxo,
} from './utxoTransactions'
import {InsufficientFunds} from '../../errors'
import {getTxInputTotal, getTxOutputTotal} from './utils'

jestSetup.setup()

const keys = [
  {
    legacyAddress:
      'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
    bechAddress:
      'ca1qw8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqeh83d4',
    pubKey:
      '8fb03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbfd8800b51c02623fceb96b07408531a5cb259f53845a38d6b68928e7c0c7e390f07545d0e62',
  },
  {
    legacyAddress:
      'Ae2tdPwUPEZ4xAL3nxLq4Py7BfS1D2tJ3u2rxZGnrAXC8TNkWhTaz41J3FN',
    bechAddress:
      'ca1q0j6cetm7zqsagm5zz5fmav9jg37n4cferj23h370kptrpfj095fxcy43lj',
    pubKey:
      'e5ac657bf0810ea37410a89df5859223e9d709c8e4a8de3e7d82b185327968939a254def91bb75e94bda9c605f7f87481082742e1e51d8858965c9a40491fc94',
  },
  {
    legacyAddress:
      'Ae2tdPwUPEZEtwz7LKtJn9ub8y7ireuj3sq2yUCZ57ccj6ZkJKn7xEiApV9',
    bechAddress:
      'ca1q0ewtxsk489t9g7vs64prkm0hfvz6aemtvtv57rkfwmxyp3yhtxtwhtm3gd',
    pubKey:
      'f2e59a16a9cab2a3cc86aa11db6fba582d773b5b16ca78764bb6620624baccb7c03adf6448459f2b8d5c32033a160de8b5412d1952794190c4fc6b4716a8b8eb',
  },
]

const sampleUtxos: Array<RawUtxo> = [
  {
    amount: '7001',
    receiver: 'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
    tx_hash: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f',
    tx_index: 0,
    utxo_id:
      '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f0',
  },
  {
    amount: '1000001',
    receiver: 'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
    tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
    tx_index: 0,
    utxo_id:
      '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
  },
  {
    amount: '10000001',
    receiver: 'Ae2tdPwUPEZ4xAL3nxLq4Py7BfS1D2tJ3u2rxZGnrAXC8TNkWhTaz41J3FN',
    tx_hash: '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a173',
    tx_index: 0,
    utxo_id:
      '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a1730',
  },
]

const sampleAdaAddresses: Array<{|address: string, ...Addressing|}> = [
  {
    address: 'ca1q0ewtxsk489t9g7vs64prkm0hfvz6aemtvtv57rkfwmxyp3yhtxtwhtm3gd',
    addressing: {
      account: 0,
      change: 1,
      index: 11,
    },
  },
  {
    address: 'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
    addressing: {
      account: 0,
      change: 0,
      index: 135,
    },
  },
  {
    address: 'Ae2tdPwUPEZ4xAL3nxLq4Py7BfS1D2tJ3u2rxZGnrAXC8TNkWhTaz41J3FN',
    addressing: {
      account: 0,
      change: 0,
      index: 134,
    },
  },
]
const addresssingMap = new Map<string, Addressing>()
for (const address of sampleAdaAddresses) {
  addresssingMap.set(address.address, {addressing: address.addressing})
}
const addressedUtxos: Array<AddressedUtxo> = sampleUtxos.map((utxo) => {
  const addressing = addresssingMap.get(utxo.receiver)
  if (addressing == null) throw new Error('Should never happen')
  return {
    ...utxo,
    ...addressing,
  }
})

describe('Create unsigned TX from UTXO', () => {
  it('Should create a valid transaction withhout selection', async () => {
    const utxos: Array<RawUtxo> = [sampleUtxos[1]]
    const unsignedTxResponse = await newAdaUnsignedTxFromUtxo(
      keys[0].bechAddress,
      '5001', // smaller than input
      [],
      utxos,
    )
    expect(unsignedTxResponse.senderUtxos).toEqual(utxos)
    const inputSum = await getTxInputTotal(unsignedTxResponse.IOs)
    const outputSum = await getTxOutputTotal(unsignedTxResponse.IOs)
    expect(inputSum.toString()).toEqual('1000001')
    expect(outputSum.toString()).toEqual('5001')
    expect(inputSum.minus(outputSum).toString()).toEqual('995000')
  })

  it('Should fail due to insufficient funds (bigger than all inputs)', async () => {
    const utxos: Array<RawUtxo> = [sampleUtxos[1]]
    const promise = newAdaUnsignedTxFromUtxo(
      keys[0].bechAddress,
      '1900001', // bigger than input including fees
      [],
      utxos,
    )
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })

  it('Should fail due to insufficient funds (no inputs)', async () => {
    const promise = newAdaUnsignedTxFromUtxo(
      keys[0].bechAddress,
      '1', // bigger than input including fees
      [],
      [],
    )
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })

  it('Should fail due to insufficient funds (not enough to cover fees)', async () => {
    const utxos: Array<RawUtxo> = [sampleUtxos[0]]
    const promise = newAdaUnsignedTxFromUtxo(
      keys[0].bechAddress,
      '1', // bigger than input including fees
      [],
      utxos,
    )
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })

  it('Should pick inputs when using input selection', async () => {
    const utxos: Array<RawUtxo> = sampleUtxos
    const unsignedTxResponse = await newAdaUnsignedTxFromUtxo(
      keys[0].bechAddress,
      '1001', // smaller than input
      [sampleAdaAddresses[0]],
      utxos,
    )
    // input selection will only take 2 of the 3 inputs
    // it takes 2 inputs because input selection algorithm
    expect(unsignedTxResponse.senderUtxos).toEqual([utxos[0], utxos[1]])
    const inputSum = await getTxInputTotal(unsignedTxResponse.IOs)
    const outputSum = await getTxOutputTotal(unsignedTxResponse.IOs)
    expect(inputSum.toString()).toEqual('1007002')
    expect(outputSum.toString()).toEqual('851617')
    expect(inputSum.minus(outputSum).toString()).toEqual('155385')
  })
})

describe('Create unsigned TX from addresses', () => {
  it('Should create a valid transaction without selection', async () => {
    const unsignedTxResponse = await newAdaUnsignedTx(
      keys[0].bechAddress,
      '5001', // smaller than input
      [],
      [addressedUtxos[0], addressedUtxos[1]],
    )
    expect(unsignedTxResponse.senderUtxos).toEqual([
      addressedUtxos[0],
      addressedUtxos[1],
    ])
    const inputSum = await getTxInputTotal(unsignedTxResponse.IOs)
    const outputSum = await getTxOutputTotal(unsignedTxResponse.IOs)
    expect(inputSum.toString()).toEqual('1007002')
    expect(outputSum.toString()).toEqual('5001')
    expect(inputSum.minus(outputSum).toString()).toEqual('1002001')
  })
})

describe('Create signed transactions with legacy witness', () => {
  it('Witness should match on valid private key', async () => {
    const unsignedTxResponse = await newAdaUnsignedTx(
      keys[0].bechAddress,
      '5001', // smaller than input
      [],
      [addressedUtxos[0], addressedUtxos[1]],
    )
    const accountPrivateKey = await Bip32PrivateKey.from_bytes(
      Buffer.from(
        '70afd5ff1f7f551c481b7e3f3541f7c63f5f6bcb293af92565af3deea0bcd6481a6e7b8acbe38f3906c63ccbe8b2d9b876572651ac5d2afc0aca284d9412bb1b4839bf02e1d990056d0f06af22ce4bcca52ac00f1074324aab96bbaaaccf290d',
        'hex',
      ),
    )
    const fragment = await signTransaction(
      unsignedTxResponse,
      accountPrivateKey,
      true,
    )
    const signedTx = await fragment.get_transaction()
    const witnesses = await signedTx.witnesses()

    expect(await witnesses.size()).toEqual(2)
    expect(await (await witnesses.get(0)).to_bech32()).toEqual(
      'witness1qz8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqf3rln4edvr5ppf35h9jt86ns3dr344k3y5w0sx8uwg0qa296rnzxm3ev8glwecyunua4ufueka7485gqrum54q4tqsdx2yjj6hahzaz9wrjpz7gxq2nm6pftxvgf39g60t5hdfxc8jecqx3m5te0yl8jrg0jtvc2',
    )
    expect(await (await witnesses.get(1)).to_bech32()).toEqual(
      'witness1qz8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqf3rln4edvr5ppf35h9jt86ns3dr344k3y5w0sx8uwg0qa296rnzxm3ev8glwecyunua4ufueka7485gqrum54q4tqsdx2yjj6hahzaz9wrjpz7gxq2nm6pftxvgf39g60t5hdfxc8jecqx3m5te0yl8jrg0jtvc2',
    )
  })
})

describe('Create signed transactions', () => {
  it('Witness should match on valid private key', async () => {
    const unsignedTxResponse = await newAdaUnsignedTx(
      keys[0].bechAddress,
      '5001', // smaller than input
      [],
      [addressedUtxos[0], addressedUtxos[1]],
    )

    const accountPrivateKey = await Bip32PrivateKey.from_bytes(
      Buffer.from(
        '70afd5ff1f7f551c481b7e3f3541f7c63f5f6bcb293af92565af3deea0bcd6481a6e7b8acbe38f3906c63ccbe8b2d9b876572651ac5d2afc0aca284d9412bb1b4839bf02e1d990056d0f06af22ce4bcca52ac00f1074324aab96bbaaaccf290d',
        'hex',
      ),
    )
    const fragment = await signTransaction(
      unsignedTxResponse,
      accountPrivateKey,
      false,
    )
    const signedTx = await fragment.get_transaction()

    const witnesses = await signedTx.witnesses()

    expect(await witnesses.size()).toEqual(2)
    expect(await (await witnesses.get(0)).to_bech32()).toEqual(
      'witness1qxn2lhu9sfj24lpzr8sglzsc6h8qpsuvurylzc9zuhn37s9uerc6xwt0zjtfv7rtsa3r0d7cydd76s9fcsw5u576vy226ux9frnpqssf9gqfz6',
    )
    expect(await (await witnesses.get(1)).to_bech32()).toEqual(
      'witness1qxn2lhu9sfj24lpzr8sglzsc6h8qpsuvurylzc9zuhn37s9uerc6xwt0zjtfv7rtsa3r0d7cydd76s9fcsw5u576vy226ux9frnpqssf9gqfz6',
    )
  })
})

describe('Create sendAll unsigned TX from UTXO', () => {
  it('Create a transaction involving all input with no change', async () => {
    const utxos: Array<RawUtxo> = [sampleUtxos[1], sampleUtxos[2]]
    const sendAllResponse = await sendAllUnsignedTxFromUtxo(
      keys[0].bechAddress,
      utxos,
    )

    expect(sendAllResponse.senderUtxos).toEqual([utxos[0], utxos[1]])
    const inputSum = await getTxInputTotal(sendAllResponse.IOs)
    const outputSum = await getTxOutputTotal(sendAllResponse.IOs)
    expect(inputSum.toString()).toEqual('11000002')
    expect(outputSum.toString()).toEqual('10844618')
    expect(inputSum.minus(outputSum).toString()).toEqual('155384')
  })

  it('Should fail due to insufficient funds (no inputs)', async () => {
    const promise = sendAllUnsignedTxFromUtxo(keys[0].bechAddress, [])
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })

  it('Should fail due to insufficient funds (not enough to cover fees)', async () => {
    const utxos: Array<RawUtxo> = [sampleUtxos[0]]
    const promise = sendAllUnsignedTxFromUtxo(keys[0].bechAddress, utxos)
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })
})
