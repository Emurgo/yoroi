// @flow
/* eslint-disable max-len */
/* eslint-disable camelcase */
import jestSetup from '../../jestSetup'

import {BigNumber} from 'bignumber.js'
import {
  Address as ShelleyAddress,
  BigNum,
  Bip32PrivateKey,
  Certificate,
  Ed25519KeyHash,
  LinearFee,
  RewardAddress,
  StakeCredential,
  StakeDelegation,
  StakeRegistration,
  StakeDeregistration,
  TransactionBody,
  TransactionBuilder,
  TransactionHash,
  TransactionInput,
  TransactionInputs,
  TransactionOutput,
  TransactionOutputs,
  make_vkey_witness,
  hash_transaction,
} from 'react-native-haskell-shelley'

import {
  newAdaUnsignedTx,
  newAdaUnsignedTxFromUtxo,
  sendAllUnsignedTxFromUtxo,
  signTransaction,
} from './transactions'
import {InsufficientFunds, NoOutputsError} from '../errors'
import {byronAddrToHex} from './utils'
import {NUMBERS} from '../../config/numbers'
import {NETWORKS} from '../../config/networks'

import type {
  Address,
  Addressing,
  AddressedUtxo,
  BaseSignRequest,
} from '../types'
import type {RawUtxo} from '../../api/types'

jestSetup.setup()

const NETWORK = NETWORKS.HASKELL_SHELLEY

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
  {
    amount: '30000000',
    // external addr 0, staking key 0
    receiver: Buffer.from(
      await (await ShelleyAddress.from_bech32(
        'addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y',
      )).to_bytes(),
    ).toString('hex'),
    tx_hash: '86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de5550',
    tx_index: 0,
    utxo_id:
      '86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de55500',
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
  {
    address: Buffer.from(
      await await ShelleyAddress.from_bech32(
        'addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y',
      ).to_bytes(),
    ).toString('hex'),
    addressing: {
      path: [0, 0],
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
      [
        {
          address: await byronAddrToHex(
            'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
          ),
          amount: '1900001', // bigger than input including fees
        },
      ],
      undefined,
      utxos,
      new BigNumber(0),
      await getProtocolParams(),
      [],
      [],
      true,
    )
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })

  it('Should fail due to insufficient funds (no inputs)', async () => {
    const promise = newAdaUnsignedTxFromUtxo(
      [
        {
          address: await byronAddrToHex(
            'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
          ),
          amount: '1', // bigger than input including fees
        },
      ],
      undefined,
      [],
      new BigNumber(0),
      await getProtocolParams(),
      [],
      [],
      true,
    )
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })

  it('Should fail due to insufficient funds (not enough to cover fees)', async () => {
    const sampleUtxos = await genSampleUtxos()
    const utxos: Array<RawUtxo> = [sampleUtxos[0]]
    const promise = newAdaUnsignedTxFromUtxo(
      [
        {
          address: await byronAddrToHex(
            'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
          ),
          amount: '1', // bigger than input including fees
        },
      ],
      undefined,
      utxos,
      new BigNumber(0),
      await getProtocolParams(),
      [],
      [],
      true,
    )
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })

  it('Should fail due to insufficient funds (no outputs disallowed)', async () => {
    const sampleUtxos = await genSampleUtxos()
    const sampleAdaAddresses = await genSampleAdaAddresses()
    const utxos: Array<RawUtxo> = [sampleUtxos[1]]

    // should fail because we disallow burning extra ADA in fees
    await expect(
      (async () =>
        newAdaUnsignedTxFromUtxo(
          [],
          sampleAdaAddresses[0],
          utxos,
          new BigNumber(0),
          {
            ...(await getProtocolParams()),
            minimumUtxoVal: BigNum.from_str('999000'),
          },
          [],
          [],
          false,
        ))(),
    ).rejects.toThrow(InsufficientFunds)
    // should avoid failing by consuming the second UTXO
    await expect(
      (async () =>
        newAdaUnsignedTxFromUtxo(
          [],
          sampleAdaAddresses[0],
          [sampleUtxos[1], sampleUtxos[0]],
          new BigNumber(0),
          {
            ...(await getProtocolParams()),
            minimumUtxoVal: await BigNum.from_str('999000'),
          },
          [],
          [],
          false,
        ))(),
    ).resolves.not.toThrow(InsufficientFunds)
    // should pass because we can add a change
    await expect(
      (async () =>
        newAdaUnsignedTxFromUtxo(
          [],
          sampleAdaAddresses[0],
          utxos,
          new BigNumber(0),
          {
            ...(await getProtocolParams()),
            minimumUtxoVal: await BigNum.from_str('998500'),
          },
          [],
          [],
          false,
        ))(),
    ).resolves.not.toThrow(InsufficientFunds)
  })

  it('Should fail due to no outputs', async () => {
    const sampleUtxos = await genSampleUtxos()
    const utxos: Array<RawUtxo> = [sampleUtxos[1]]
    expect(
      (async () =>
        newAdaUnsignedTxFromUtxo(
          [],
          undefined,
          utxos,
          new BigNumber(0),
          await getProtocolParams(),
          [],
          [],
          false,
        ))(),
    ).rejects.toThrow(NoOutputsError)
  })

  it('Should pick inputs when using input selection', async () => {
    const utxos: Array<RawUtxo> = await genSampleUtxos()
    const sampleAdaAddresses = await genSampleAdaAddresses()
    const unsignedTxResponse = await newAdaUnsignedTxFromUtxo(
      [
        {
          address: await byronAddrToHex(
            'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
          ),
          amount: '1001', // smaller than input
        },
      ],
      sampleAdaAddresses[0],
      utxos,
      new BigNumber(0),
      await getProtocolParams(),
      [],
      [],
      true,
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
      await (await unsignedTxResponse.txBuilder.min_fee()).to_str(),
    ).toEqual('1166')
  })
})

describe('Create unsigned TX from addresses', () => {
  it('Should create a valid transaction without selection', async () => {
    const addressedUtxos = await genAddressedUtxos()
    const unsignedTxResponse = await newAdaUnsignedTx(
      [
        {
          address: await byronAddrToHex(
            'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
          ),
          amount: '5001', // smaller than input
        },
      ],
      undefined,
      [addressedUtxos[0], addressedUtxos[1]],
      new BigNumber(0),
      await getProtocolParams(),
      [],
      [],
      true,
    )
    expect(unsignedTxResponse.senderUtxos).toEqual([
      addressedUtxos[0],
      addressedUtxos[1],
    ])

    expect(
      await (await unsignedTxResponse.txBuilder.get_explicit_input()).to_str(),
    ).toEqual('1000702')
    expect(
      await (await unsignedTxResponse.txBuilder.get_explicit_output()).to_str(),
    ).toEqual('5001')
    expect(
      await (await unsignedTxResponse.txBuilder.min_fee()).to_str(),
    ).toEqual('1064')
    // burns remaining amount
    expect(
      await (await (await unsignedTxResponse.txBuilder.get_explicit_input()).checked_sub(
        await unsignedTxResponse.txBuilder.get_explicit_output(),
      )).to_str(),
    ).toEqual(
      await (await await unsignedTxResponse.txBuilder.build().fee()).to_str(),
    )
  })
})

describe('Create signed transactions', () => {
  it('Witness should match on valid private key', async () => {
    const addressedUtxos = await genAddressedUtxos()
    const unsignedTxResponse = await newAdaUnsignedTx(
      [
        {
          address: await byronAddrToHex(
            'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
          ),
          amount: '5001', // smaller than input
        },
      ],
      undefined,
      [addressedUtxos[0], addressedUtxos[1]],
      new BigNumber(0),
      await getProtocolParams(),
      [],
      [],
      true,
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
      new Set(),
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
      '8458208fb03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbfd8800b51c05840d4da0fe3615f90581926281be0510df5f6616ebed5a6d6831cceab4dd9935f7f5b6150d43b918d79e8db7cd3e17b9de91fdfbaed7cdab18818331942852fd10b58202623fceb96b07408531a5cb259f53845a38d6b68928e7c0c7e390f07545d0e6241a0',
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
      new Set(),
      undefined,
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
      '8458208fb03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbfd8800b51c058401edebb108c74a991bef5b28458778fc0713499349d77fb98acc63e4219cfcd1b51321ccaccdf2ce2e80d7c2687f3d79feea32daedcfbc19792dff0358af5950358202623fceb96b07408531a5cb259f53845a38d6b68928e7c0c7e390f07545d0e6241a0',
    )
  })

  it('Transaction should support certificates', async () => {
    const accountPrivateKey = await Bip32PrivateKey.from_bytes(
      Buffer.from(
        '408a1cb637d615c49e8696c30dd54883302a20a7b9b8a9d1c307d2ed3cd50758c9402acd000461a8fc0f25728666e6d3b86d031b8eea8d2f69b21e8aa6ba2b153e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
        'hex',
      ),
    )
    const stakingKey = await (await (await accountPrivateKey.derive(2)).derive(
      NUMBERS.STAKING_KEY_INDEX,
    )).to_raw_key()

    const addressedUtxos = await genAddressedUtxos()
    const unsignedTxResponse = await newAdaUnsignedTx(
      [
        {
          address: await byronAddrToHex(
            'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
          ),
          amount: '5001', // smaller than input
        },
      ],
      undefined,
      [addressedUtxos[3]],
      new BigNumber(0),
      await getProtocolParams(),
      [
        await Certificate.new_stake_registration(
          await StakeRegistration.new(
            await StakeCredential.from_keyhash(
              await (await stakingKey.to_public()).hash(),
            ),
          ),
        ),
        await Certificate.new_stake_delegation(
          await StakeDelegation.new(
            await StakeCredential.from_keyhash(
              await (await stakingKey.to_public()).hash(),
            ),
            await Ed25519KeyHash.from_bytes(
              Buffer.from(
                '1b268f4cba3faa7e36d8a0cc4adca2096fb856119412ee7330f692b5',
                'hex',
              ),
            ),
          ),
        ),
      ],
      [],
      true,
    )
    const signRequest: BaseSignRequest<TransactionBuilder> = {
      changeAddr: unsignedTxResponse.changeAddr,
      senderUtxos: unsignedTxResponse.senderUtxos,
      unsignedTx: unsignedTxResponse.txBuilder,
      certificate: undefined,
    }
    const signedTx = await signTransaction(
      signRequest,
      NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
      accountPrivateKey,
      new Set([
        Buffer.from(
          await (await make_vkey_witness(
            await hash_transaction(await signRequest.unsignedTx.build()),
            stakingKey,
          )).to_bytes(),
        ).toString('hex'),
      ]),
      undefined,
    )
    const witnesses = await signedTx.witness_set()

    const vKeyWits = await witnesses.vkeys()
    if (vKeyWits == null) throw new Error('Vkey witnesses should not be null')
    expect(await vKeyWits.len()).toEqual(2)
    expect(await witnesses.scripts()).toEqual(undefined)
    expect(await witnesses.bootstraps()).toEqual(undefined)

    // set is used so order not defined so we sort the list
    const witArray = [
      Buffer.from(await (await vKeyWits.get(0)).to_bytes()).toString('hex'),
      Buffer.from(await (await vKeyWits.get(1)).to_bytes()).toString('hex'),
    ].sort()

    expect(witArray).toEqual([
      '82582001c01f8b958699ae769a246e9785db5a70e023977ea4b856dfacf23c23346caf58401b10a18433be709391e70a82c4de91d1c8b3cb27dfa7c7d19a247a4dfe5dea437a0ebefe3ced5f6f7ad2bc79b11c5556614f8bec19b87fc5145a13edc3ae320f',
      '82582038c14a0756e1743081a8ebfdb9169b11283a7bf6c38045c4c4a5e62a7689639d58403a56ed05738ec98589a1263281bfd33ec5f0bed3f90eafced8ed8652be65f3327487cb487dde0d26ca9a7ce568a4c05367630baec47a5d771ba7b184161b100d',
    ])
  })

  it('Transaction should support withdrawals', async () => {
    const accountPrivateKey = await Bip32PrivateKey.from_bytes(
      Buffer.from(
        '408a1cb637d615c49e8696c30dd54883302a20a7b9b8a9d1c307d2ed3cd50758c9402acd000461a8fc0f25728666e6d3b86d031b8eea8d2f69b21e8aa6ba2b153e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
        'hex',
      ),
    )
    const stakingKey = await (await (await accountPrivateKey.derive(2)).derive(
      NUMBERS.STAKING_KEY_INDEX,
    )).to_raw_key()
    const stakingKeyCredential = await StakeCredential.from_keyhash(
      await (await stakingKey.to_public()).hash(),
    )

    if (NETWORK.CHAIN_NETWORK_ID == null) {
      throw new Error('missing network id')
    }

    const protocolParams = await getProtocolParams()
    const withdrawAmount = '1000000'
    const addressedUtxos = await genAddressedUtxos()
    const sampleAdaAddresses = await genSampleAdaAddresses()
    const unsignedTxResponse = await newAdaUnsignedTx(
      [],
      sampleAdaAddresses[3],
      [addressedUtxos[3]],
      new BigNumber(0),
      protocolParams,
      [
        await Certificate.new_stake_deregistration(
          await StakeDeregistration.new(stakingKeyCredential),
        ),
      ],
      [
        {
          address: await RewardAddress.new(
            Number.parseInt(NETWORK.CHAIN_NETWORK_ID, 10),
            stakingKeyCredential,
          ),
          amount: await BigNum.from_str(withdrawAmount),
        },
      ],
      true,
    )
    const signRequest: BaseSignRequest<TransactionBuilder> = {
      changeAddr: unsignedTxResponse.changeAddr,
      senderUtxos: unsignedTxResponse.senderUtxos,
      unsignedTx: unsignedTxResponse.txBuilder,
      certificate: undefined,
    }
    const signedTx = await signTransaction(
      signRequest,
      NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
      accountPrivateKey,
      new Set([
        Buffer.from(
          await (await make_vkey_witness(
            await hash_transaction(await signRequest.unsignedTx.build()),
            stakingKey,
          )).to_bytes(),
        ).toString('hex'),
      ]),
      undefined,
    )
    const witnesses = await signedTx.witness_set()

    const vKeyWits = await witnesses.vkeys()
    if (vKeyWits == null) throw new Error('Vkey witnesses should not be null')
    expect(await vKeyWits.len()).toEqual(2)
    expect(await witnesses.scripts()).toEqual(undefined)
    expect(await witnesses.bootstraps()).toEqual(undefined)

    const txBody = await unsignedTxResponse.txBuilder.build()
    const withdrawals = await txBody.withdrawals()
    if (withdrawals == null) throw new Error('Withdrawals should not be null')
    expect(await withdrawals.len()).toEqual(1)
    const fee = await (await txBody.fee()).to_str()
    expect(fee).toEqual('1310')
    expect(await (await txBody.outputs()).len()).toEqual(1)
    expect(
      await (await (await (await txBody.outputs()).get(0)).amount()).to_str(),
    ).toEqual(
      new BigNumber(addressedUtxos[3].amount)
        .minus(fee)
        .plus(withdrawAmount)
        .plus(await protocolParams.keyDeposit.to_str())
        .toString(),
    )

    // set is used so order not defined so we sort the list
    const witArray = [
      Buffer.from(await (await vKeyWits.get(0)).to_bytes()).toString('hex'),
      Buffer.from(await (await vKeyWits.get(1)).to_bytes()).toString('hex'),
    ].sort()

    expect(witArray).toEqual([
      '82582001c01f8b958699ae769a246e9785db5a70e023977ea4b856dfacf23c23346caf5840ed278dd61c950a8e8c8a5252dd028ac5ccde0571be351bd84e7d363071bb852ae803d5cd882036d3d6495a3a20078c3843c15be6c76236bc5f25f432acf3f108',
      '82582038c14a0756e1743081a8ebfdb9169b11283a7bf6c38045c4c4a5e62a7689639d5840f533e0d1bad015c5b2f409309405c58ae27f5da6b38e24f3e7b92faba77dee0021865d6a2b70dcc3cb5b816469affd42f0aff83edf5c4773c861ee0255991f03',
    ])
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
        await (await sendAllResponse.txBuilder.min_fee()).to_str(),
      ).toEqual('1342')
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
