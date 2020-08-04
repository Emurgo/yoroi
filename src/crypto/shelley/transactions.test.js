// @flow
/* eslint-disable max-len */
import jestSetup from '../../jestSetup'

import {BigNumber} from 'bignumber.js'
import {
  Address as ShelleyAddress,
  BigNum,
  Bip32PrivateKey,
  LinearFee,
  TransactionBody,
  TransactionBuilder,
  TransactionHash,
  TransactionInput,
  TransactionInputs,
  TransactionOutput,
  TransactionOutputs,
} from 'react-native-haskell-shelley'

import {
  newAdaUnsignedTx,
  newAdaUnsignedTxFromUtxo,
  sendAllUnsignedTxFromUtxo,
  signTransaction,
} from './transactions'
import {InsufficientFunds} from '../errors'
import {byronAddrToHex} from './utils'
import {NUMBERS} from '../../config/numbers'

import type {
  Address,
  Addressing,
  AddressedUtxo,
  BaseSignRequest,
} from '../types'
import type {RawUtxo} from '../../api/types'

jestSetup.setup()

const genSampleUtxos: (void) => Promise<Array<RawUtxo>> = async () => [
  {
    amount: '701',
    receiver: await byronAddrToHex(
      'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
    ),
    tx_hash: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f',
    tx_index: 0,
    utxo_id:
      '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f0',
  },
  {
    amount: '1000001',
    receiver: await byronAddrToHex(
      'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
    ),
    tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
    tx_index: 0,
    utxo_id:
      '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
  },
  {
    amount: '10000001',
    receiver: await byronAddrToHex(
      'Ae2tdPwUPEZ4xAL3nxLq4Py7BfS1D2tJ3u2rxZGnrAXC8TNkWhTaz41J3FN',
    ),
    tx_hash: '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a173',
    tx_index: 0,
    utxo_id:
      '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a1730',
  },
]

const genSampleAdaAddresses: (void) => Promise<
  Array<{|
    ...Address,
    ...Addressing,
  |}>,
> = async () => [
  {
    address: await byronAddrToHex(
      'Ae2tdPwUPEZEtwz7LKtJn9ub8y7ireuj3sq2yUCZ57ccj6ZkJKn7xEiApV9',
    ),
    addressing: {
      path: [1, 11],
      startLevel: NUMBERS.BIP44_DERIVATION_LEVELS.CHAIN,
    },
  },
  {
    address: await byronAddrToHex(
      'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
    ),
    addressing: {
      path: [0, 135],
      startLevel: NUMBERS.BIP44_DERIVATION_LEVELS.CHAIN,
    },
  },
  {
    address: await byronAddrToHex(
      'Ae2tdPwUPEZ4xAL3nxLq4Py7BfS1D2tJ3u2rxZGnrAXC8TNkWhTaz41J3FN',
    ),
    addressing: {
      path: [0, 134],
      startLevel: NUMBERS.BIP44_DERIVATION_LEVELS.CHAIN,
    },
  },
]
const genAddressedUtxos: (void) => Promise<Array<AddressedUtxo>> = async () => {
  const addressingMap = new Map<string, Addressing>()
  for (const address of await genSampleAdaAddresses()) {
    addressingMap.set(address.address, {addressing: address.addressing})
  }
  return (await genSampleUtxos()).map((utxo) => {
    const addressing = addressingMap.get(utxo.receiver)
    if (addressing == null) throw new Error('Should never happen')
    return {
      ...utxo,
      ...addressing,
    }
  })
}

const getProtocolParams: () => Promise<{|
  linearFee: LinearFee,
  minimumUtxoVal: BigNum,
  poolDeposit: BigNum,
  keyDeposit: BigNum,
|}> = async () => {
  return {
    linearFee: await LinearFee.new(
      await BigNum.from_str('2'),
      await BigNum.from_str('500'),
    ),
    minimumUtxoVal: await BigNum.from_str('1'),
    poolDeposit: await BigNum.from_str('500'),
    keyDeposit: await BigNum.from_str('500'),
  }
}

describe('Create unsigned TX from UTXO', () => {
  it('Should fail due to insufficient funds (bigger than all inputs)', async () => {
    const sampleUtxos = await genSampleUtxos()
    const utxos: Array<RawUtxo> = [sampleUtxos[1]]
    const promise = newAdaUnsignedTxFromUtxo(
      await byronAddrToHex(
        'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
      ),
      '1900001', // bigger than input including fees
      undefined,
      utxos,
      new BigNumber(0),
      await getProtocolParams(),
    )
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })

  it('Should fail due to insufficient funds (no inputs)', async () => {
    const promise = newAdaUnsignedTxFromUtxo(
      await byronAddrToHex(
        'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
      ),
      '1', // bigger than input including fees
      undefined,
      [],
      new BigNumber(0),
      await getProtocolParams(),
    )
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })

  it('Should fail due to insufficient funds (not enough to cover fees)', async () => {
    const sampleUtxos = await genSampleUtxos()
    const utxos: Array<RawUtxo> = [sampleUtxos[0]]
    const promise = newAdaUnsignedTxFromUtxo(
      await byronAddrToHex(
        'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
      ),
      '1', // bigger than input including fees
      undefined,
      utxos,
      new BigNumber(0),
      await getProtocolParams(),
    )
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })

  it('Should pick inputs when using input selection', async () => {
    const utxos: Array<RawUtxo> = await genSampleUtxos()
    const sampleAdaAddresses = await genSampleAdaAddresses()
    const unsignedTxResponse = await newAdaUnsignedTxFromUtxo(
      await byronAddrToHex(
        'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
      ),
      '1001', // smaller than input
      sampleAdaAddresses[0],
      utxos,
      new BigNumber(0),
      await getProtocolParams(),
    )
    // input selection will only take 2 of the 3 inputs
    // it takes 2 inputs because input selection algorithm
    expect(unsignedTxResponse.senderUtxos).toEqual([utxos[0], utxos[1]])
    expect(
      await (await unsignedTxResponse.txBuilder.get_explicit_input()).to_str(),
    ).toEqual('1000702')
    expect(
      await (await unsignedTxResponse.txBuilder.get_explicit_output()).to_str(),
    ).toEqual('999528')
    expect(
      await (await unsignedTxResponse.txBuilder.estimate_fee()).to_str(),
    ).toEqual('1154')
  })
})

describe('Create unsigned TX from addresses', () => {
  it('Should create a valid transaction without selection', async () => {
    const addressedUtxos = await genAddressedUtxos()
    const unsignedTxResponse = await newAdaUnsignedTx(
      await byronAddrToHex(
        'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
      ),
      '5001', // smaller than input
      undefined,
      [addressedUtxos[0], addressedUtxos[1]],
      new BigNumber(0),
      await getProtocolParams(),
    )
    expect(unsignedTxResponse.senderUtxos).toEqual([
      addressedUtxos[0],
      addressedUtxos[1],
    ])

    expect(unsignedTxResponse.txBuilder.get_explicit_input().to_str()).toEqual(
      '1000702',
    )
    expect(unsignedTxResponse.txBuilder.get_explicit_output().to_str()).toEqual(
      '5001',
    )
    expect(unsignedTxResponse.txBuilder.estimate_fee().to_str()).toEqual('1052')
    // burns remaining amount
    expect(
      unsignedTxResponse.txBuilder
        .get_explicit_input()
        .checked_sub(unsignedTxResponse.txBuilder.get_explicit_output())
        .to_str(),
    ).toEqual('995701')
  })
})

describe('Create signed transactions', () => {
  it('Witness should match on valid private key', async () => {
    const addressedUtxos = await genAddressedUtxos()
    const unsignedTxResponse = await newAdaUnsignedTx(
      await byronAddrToHex(
        'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
      ),
      '5001', // smaller than input
      undefined,
      [addressedUtxos[0], addressedUtxos[1]],
      new BigNumber(0),
      await getProtocolParams(),
    )
    const signRequest: BaseSignRequest<TransactionBuilder> = {
      changeAddr: unsignedTxResponse.changeAddr,
      senderUtxos: unsignedTxResponse.senderUtxos,
      unsignedTx: unsignedTxResponse.txBuilder,
      certificate: undefined,
    }

    const accountPrivateKey = await Bip32PrivateKey.from_bytes(
      Buffer.from(
        '70afd5ff1f7f551c481b7e3f3541f7c63f5f6bcb293af92565af3deea0bcd6481a6e7b8acbe38f3906c63ccbe8b2d9b876572651ac5d2afc0aca284d9412bb1b4839bf02e1d990056d0f06af22ce4bcca52ac00f1074324aab96bbaaaccf290d',
        'hex',
      ),
    )
    const signedTx = await signTransaction(
      signRequest,
      NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
      accountPrivateKey,
      undefined,
    )
    const witnesses = await signedTx.witness_set()

    expect(await witnesses.vkeys()).toEqual(undefined)
    expect(await witnesses.scripts()).toEqual(undefined)
    const bootstrapWits = await witnesses.bootstraps()
    if (bootstrapWits == null) {
      throw new Error('Bootstrap witnesses should not be null')
    }
    expect(await bootstrapWits.len()).toEqual(1)

    expect(
      Buffer.from(await (await bootstrapWits.get(0)).to_bytes()).toString(
        'hex',
      ),
    ).toEqual(
      '8458208fb03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbfd8800b51c0584053685c27ee95dc8e2ea87e6c9e7b0557c7d060cc9d18ada7df3c2eec5949011c76e8647b072fe3fa8310894f087b097cbb15d7fbcc743100a716bf5df3c6190058202623fceb96b07408531a5cb259f53845a38d6b68928e7c0c7e390f07545d0e6241a0',
    )
  })

  it('Witness should match with addressing from root', async () => {
    const accountPrivateKey = await Bip32PrivateKey.from_bytes(
      Buffer.from(
        '70afd5ff1f7f551c481b7e3f3541f7c63f5f6bcb293af92565af3deea0bcd6481a6e7b8acbe38f3906c63ccbe8b2d9b876572651ac5d2afc0aca284d9412bb1b4839bf02e1d990056d0f06af22ce4bcca52ac00f1074324aab96bbaaaccf290d',
        'hex',
      ),
    )
    const inputs = await TransactionInputs.new()
    await inputs.add(
      await TransactionInput.new(
        await TransactionHash.from_bytes(
          Buffer.from(
            '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f',
            'hex',
          ),
        ),
        0,
      ),
    )
    await inputs.add(
      await TransactionInput.new(
        await TransactionHash.from_bytes(
          Buffer.from(
            '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
            'hex',
          ),
        ),
        0,
      ),
    )
    const outputs = await TransactionOutputs.new()
    await outputs.add(
      await TransactionOutput.new(
        await ShelleyAddress.from_bytes(
          Buffer.from(
            await byronAddrToHex(
              'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
            ),
            'hex',
          ),
        ),
        await BigNum.from_str('5001'),
      ),
    )
    const txBody = await TransactionBody.new(
      inputs,
      outputs,
      await BigNum.from_str('1000'),
      0,
    )
    const signRequest: BaseSignRequest<TransactionBody> = {
      changeAddr: [],
      senderUtxos: [
        {
          amount: '7001',
          receiver: await byronAddrToHex(
            'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
          ),
          tx_hash:
            '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f',
          tx_index: 0,
          utxo_id:
            '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f0',
          addressing: {
            path: [
              NUMBERS.WALLET_TYPE_PURPOSE.BIP44,
              NUMBERS.COIN_TYPES.CARDANO,
              NUMBERS.HARD_DERIVATION_START + 0,
              0,
              135,
            ],
            startLevel: 1,
          },
        },
        {
          amount: '1000001',
          receiver: await byronAddrToHex(
            'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
          ),
          tx_hash:
            '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
          tx_index: 0,
          utxo_id:
            '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
          addressing: {
            path: [
              NUMBERS.WALLET_TYPE_PURPOSE.BIP44,
              NUMBERS.COIN_TYPES.CARDANO,
              NUMBERS.HARD_DERIVATION_START + 0,
              0,
              135,
            ],
            startLevel: 1,
          },
        },
      ],
      unsignedTx: txBody,
      certificate: undefined,
    }

    const signedTx = await signTransaction(
      signRequest,
      NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
      accountPrivateKey,
    )
    const witnesses = await signedTx.witness_set()

    expect(await witnesses.vkeys()).toEqual(undefined)
    expect(await witnesses.scripts()).toEqual(undefined)
    const bootstrapWits = await witnesses.bootstraps()
    if (bootstrapWits == null) {
      throw new Error('Bootstrap witnesses should not be null')
    }
    // note: only one witness since we got rid of duplicates
    expect(await bootstrapWits.len()).toEqual(1)

    expect(
      Buffer.from(await (await bootstrapWits.get(0)).to_bytes()).toString(
        'hex',
      ),
    ).toEqual(
      /* eslint-disable-next-line max-len */
      '8458208fb03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbfd8800b51c058401edebb108c74a991bef5b28458778fc0713499349d77fb98acc63e4219cfcd1b51321ccaccdf2ce2e80d7c2687f3d79feea32daedcfbc19792dff0358af5950358202623fceb96b07408531a5cb259f53845a38d6b68928e7c0c7e390f07545d0e6241a0',
    )
  })
})

describe('Create sendAll unsigned TX from UTXO', () => {
  describe('Create send-all TX from UTXO', () => {
    it('Create a transaction involving all input with no change', async () => {
      const sampleUtxos = await genSampleUtxos()
      const utxos: Array<RawUtxo> = [sampleUtxos[1], sampleUtxos[2]]
      const sendAllResponse = await sendAllUnsignedTxFromUtxo(
        await byronAddrToHex(
          'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
        ),
        utxos,
        new BigNumber(0),
        await getProtocolParams(),
      )

      expect(sendAllResponse.senderUtxos).toEqual([utxos[0], utxos[1]])
      expect(
        await (await sendAllResponse.txBuilder.get_explicit_input()).to_str(),
      ).toEqual('11000002')
      expect(
        await (await sendAllResponse.txBuilder.get_explicit_output()).to_str(),
      ).toEqual('10998652')
      expect(
        await (await sendAllResponse.txBuilder.estimate_fee()).to_str(),
      ).toEqual('1330')
      // make sure we don't accidentally burn a lot of coins
      expect(
        await await (await sendAllResponse.txBuilder.get_explicit_input())
          .checked_sub(await sendAllResponse.txBuilder.get_explicit_output())
          .to_str(),
      ).toEqual('1350')
    })
  })

  it('Should fail due to insufficient funds (no inputs)', async () => {
    const promise = sendAllUnsignedTxFromUtxo(
      await byronAddrToHex(
        'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
      ),
      [],
      new BigNumber(0),
      await getProtocolParams(),
    )
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })

  it('Should fail due to insufficient funds (not enough to cover fees)', async () => {
    const sampleUtxos = await genSampleUtxos()
    const utxos: Array<RawUtxo> = [sampleUtxos[0]]
    const promise = sendAllUnsignedTxFromUtxo(
      await byronAddrToHex(
        'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
      ),
      utxos,
      new BigNumber(0),
      await getProtocolParams(),
    )
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })
})
