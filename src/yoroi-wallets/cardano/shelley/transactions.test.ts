/* eslint-disable @typescript-eslint/no-explicit-any */

import {BigNumber} from 'bignumber.js'

import {CONFIG, getDefaultAssets} from '../../../legacy/config'
import {AssetOverflowError, InsufficientFunds, NoOutputsError} from '../../../legacy/errors'
import {NETWORKS} from '../../../legacy/networks'
import type {RawUtxo} from '../../../legacy/types'
import type {Addressing} from '../../../legacy/types'
import {byronAddrToHex, identifierToCardanoAsset} from '../../../legacy/utils'
import {
  Address,
  BigNum,
  Bip32PrivateKey,
  Certificate,
  Ed25519KeyHash,
  LinearFee,
  MultiToken,
  StakeCredential,
  StakeDelegation,
  StakeRegistration,
  TransactionBody,
  TransactionHash,
  TransactionInput,
  TransactionInputs,
  TransactionOutput,
  TransactionOutputs,
  Value,
} from '../..'
import {hashTransaction, makeVkeyWitness, RewardAddress, StakeDeregistration} from '..'
import {newAdaUnsignedTx, newAdaUnsignedTxFromUtxo, sendAllUnsignedTxFromUtxo, signTransaction} from './transactions'

const NUMBERS = CONFIG.NUMBERS
const NETWORK = NETWORKS.HASKELL_SHELLEY

const defaultIdentifier = getDefaultAssets().filter((asset) => asset.networkId === NETWORK.NETWORK_ID)[0].identifier

const testAssetId = 'd27197682d71905c087c5c3b61b10e6d746db0b9bef351014d75bb26.6e69636f696e'

const genSampleUtxos = async () => [
  {
    amount: '701',
    receiver: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
    tx_hash: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f',
    tx_index: 0,
    utxo_id: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f0',
    assets: [],
  },
  {
    amount: '1000001',
    receiver: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
    tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
    tx_index: 0,
    utxo_id: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
    assets: [],
  },
  {
    amount: '10000001',
    receiver: await byronAddrToHex('Ae2tdPwUPEZ4xAL3nxLq4Py7BfS1D2tJ3u2rxZGnrAXC8TNkWhTaz41J3FN'),
    tx_hash: '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a173',
    tx_index: 0,
    utxo_id: '0df0273e382739f8b4ae3783d81168093e78e0b48ec2c5430ff03d444806a1730',
    assets: [],
  },
  {
    amount: '30000000',
    // external addr 0, staking key 0
    receiver: Buffer.from(
      await (
        await Address.fromBech32(
          'addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y',
        )
      ).toBytes(),
    ).toString('hex'),
    tx_hash: '86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de5550',
    tx_index: 0,
    utxo_id: '86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de55500',
    assets: [],
  },
  {
    amount: '1000001',
    receiver: Buffer.from(
      await (
        await Address.fromBech32(
          // external addr 0, staking key 0
          'addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y',
        )
      ).toBytes(),
    ).toString('hex'),
    tx_hash: '86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de5550',
    tx_index: 0,
    utxo_id: '86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de55500',
    assets: [
      {
        amount: '1234',
        assetId: testAssetId,
        policyId: testAssetId.split('.')[0],
        name: testAssetId.split('.')[1],
      },
    ],
  },
  {
    amount: '10000001',
    receiver: Buffer.from(
      await (
        await Address.fromBech32(
          // external addr 0, staking key 0
          'addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y',
        )
      ).toBytes(),
    ).toString('hex'),
    tx_hash: '86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de5550',
    tx_index: 0,
    utxo_id: '86e36b6a65d82c9dcc0370b0ee3953aee579db0b837753306405c28a74de55500',
    assets: [
      {
        amount: '18446744073709551615', // max u64
        assetId: testAssetId,
        policyId: testAssetId.split('.')[0],
        name: testAssetId.split('.')[1],
      },
    ],
  },
]

const genSampleAdaAddresses = async () => [
  {
    address: await byronAddrToHex('Ae2tdPwUPEZEtwz7LKtJn9ub8y7ireuj3sq2yUCZ57ccj6ZkJKn7xEiApV9'),
    addressing: {
      path: [1, 11],
      startLevel: NUMBERS.BIP44_DERIVATION_LEVELS.CHAIN,
    },
  },
  {
    address: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
    addressing: {
      path: [0, 135],
      startLevel: NUMBERS.BIP44_DERIVATION_LEVELS.CHAIN,
    },
  },
  {
    address: await byronAddrToHex('Ae2tdPwUPEZ4xAL3nxLq4Py7BfS1D2tJ3u2rxZGnrAXC8TNkWhTaz41J3FN'),
    addressing: {
      path: [0, 134],
      startLevel: NUMBERS.BIP44_DERIVATION_LEVELS.CHAIN,
    },
  },
  {
    address: Buffer.from(
      await (
        await Address.fromBech32(
          'addr1q8gpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqphf76y',
        )
      ).toBytes(),
    ).toString('hex'),
    addressing: {
      path: [0, 0],
      startLevel: NUMBERS.BIP44_DERIVATION_LEVELS.CHAIN,
    },
  },
]
const genAddressedUtxos = async () => {
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

const getProtocolParams = async () => {
  return {
    linearFee: await LinearFee.new(await BigNum.fromStr('2'), await BigNum.fromStr('500')),
    minimumUtxoVal: await BigNum.fromStr('1'),
    poolDeposit: await BigNum.fromStr('500'),
    keyDeposit: await BigNum.fromStr('500'),
    networkId: NETWORK.NETWORK_ID,
  }
}

describe('Create unsigned TX from UTXO', () => {
  it('Should fail due to insufficient funds (bigger than all inputs)', async () => {
    const sampleUtxos = await genSampleUtxos()
    const output = new MultiToken(
      [
        {
          // bigger than input including fees
          amount: new BigNumber(1900001),
          identifier: defaultIdentifier,
          networkId: NETWORK.NETWORK_ID,
        },
      ],
      {
        defaultIdentifier,
        defaultNetworkId: NETWORK.NETWORK_ID,
      },
    )
    const utxos: Array<RawUtxo> = [sampleUtxos[1]]
    const promise = newAdaUnsignedTxFromUtxo(
      [
        {
          address: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
          amount: output,
        },
      ],
      undefined,
      utxos,
      new BigNumber(0),
      (await getProtocolParams()) as any,
      [],
      [],
      true,
    )
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })

  it('Should fail due to insufficient funds (no inputs)', async () => {
    const output = new MultiToken(
      [
        {
          // bigger than input including fees
          amount: new BigNumber(1),
          identifier: defaultIdentifier,
          networkId: NETWORK.NETWORK_ID,
        },
      ],
      {
        defaultIdentifier,
        defaultNetworkId: NETWORK.NETWORK_ID,
      },
    )
    const promise = newAdaUnsignedTxFromUtxo(
      [
        {
          address: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
          amount: output,
        },
      ],
      undefined,
      [], // no utxos
      new BigNumber(0),
      (await getProtocolParams()) as any,
      [],
      [],
      true,
    )
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })

  it('Should fail due to insufficient funds (not enough to cover fees)', async () => {
    const output = new MultiToken(
      [
        {
          // bigger than input including fees
          amount: new BigNumber(1),
          identifier: defaultIdentifier,
          networkId: NETWORK.NETWORK_ID,
        },
      ],
      {
        defaultIdentifier,
        defaultNetworkId: NETWORK.NETWORK_ID,
      },
    )
    const sampleUtxos = await genSampleUtxos()
    const utxos: Array<RawUtxo> = [sampleUtxos[0]]
    const promise = newAdaUnsignedTxFromUtxo(
      [
        {
          address: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
          amount: output,
        },
      ],
      undefined,
      utxos,
      new BigNumber(0),
      (await getProtocolParams()) as any,
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
            ...((await getProtocolParams()) as any),
            // high enough that we can't send the remaining amount as change
            minimumUtxoVal: BigNum.fromStr('999100'),
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
            ...((await getProtocolParams()) as any),
            minimumUtxoVal: await BigNum.fromStr('999000'),
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
            ...((await getProtocolParams()) as any),
            minimumUtxoVal: await BigNum.fromStr('998500'),
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
    await expect(
      (async () =>
        newAdaUnsignedTxFromUtxo(
          [],
          undefined,
          utxos,
          new BigNumber(0),
          (await getProtocolParams()) as any,
          [],
          [],
          false,
        ))(),
    ).rejects.toThrow(NoOutputsError)
  })

  it('Should pick ada-only inputs when using input selection', async () => {
    const utxos: Array<RawUtxo> = await genSampleUtxos()
    const sampleAdaAddresses = await genSampleAdaAddresses()

    const output = new MultiToken(
      [
        {
          // smaller than input
          amount: new BigNumber(1001),
          identifier: defaultIdentifier,
          networkId: NETWORK.NETWORK_ID,
        },
      ],
      {
        defaultIdentifier,
        defaultNetworkId: NETWORK.NETWORK_ID,
      },
    )

    const unsignedTxResponse = await newAdaUnsignedTxFromUtxo(
      [
        {
          address: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
          amount: output,
        },
      ],
      sampleAdaAddresses[0],
      [utxos[0], utxos[1], utxos[2], utxos[3]],
      new BigNumber(0),
      (await getProtocolParams()) as any,
      [],
      [],
      true,
    )
    // input selection will only take 2 of the 3 inputs
    // it takes 2 inputs because input selection algorithm
    const expectedFee = new BigNumber('1166')
    expect(unsignedTxResponse.senderUtxos).toEqual([utxos[0], utxos[1]])
    expect(await (await (await unsignedTxResponse.txBuilder.getExplicitInput()).coin()).toStr()).toEqual('1000702')
    expect(await (await (await unsignedTxResponse.txBuilder.getExplicitOutput()).coin()).toStr()).toEqual('999536')
    expect(await (await unsignedTxResponse.txBuilder.minFee()).toStr()).toEqual(expectedFee.toString())
  })

  it('Should exclude ada-only inputs smaller than fee to include them', async () => {
    const utxos: Array<RawUtxo> = await genSampleUtxos()
    const sampleAdaAddresses = await genSampleAdaAddresses()

    const output = new MultiToken(
      [
        {
          // smaller than input
          amount: new BigNumber(1001),
          identifier: defaultIdentifier,
          networkId: NETWORK.NETWORK_ID,
        },
      ],
      {
        defaultIdentifier,
        defaultNetworkId: NETWORK.NETWORK_ID,
      },
    )

    const unsignedTxResponse = await newAdaUnsignedTxFromUtxo(
      [
        {
          address: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
          amount: output,
        },
      ],
      sampleAdaAddresses[0],
      [utxos[0], utxos[1]],
      new BigNumber(0),
      {
        linearFee: await LinearFee.new(
          // make sure the 1st utxo is excluded since it's too small
          await BigNum.fromStr(new BigNumber(utxos[0].amount).plus(1).toString()),
          await BigNum.fromStr('500'),
        ),
        minimumUtxoVal: (await BigNum.fromStr('1')) as any,
        poolDeposit: (await BigNum.fromStr('500')) as any,
        keyDeposit: (await BigNum.fromStr('500')) as any,
        networkId: NETWORK.NETWORK_ID,
      },
      [],
      [],
      true,
    )
    // input selection will only take 2 of the 3 inputs
    // it takes 2 inputs because input selection algorithm
    const expectedFee = new BigNumber('208994')
    expect(unsignedTxResponse.senderUtxos).toEqual([utxos[1]])
    expect(await (await (await unsignedTxResponse.txBuilder.getExplicitInput()).coin()).toStr()).toEqual('1000001')
    expect(await (await (await unsignedTxResponse.txBuilder.getExplicitOutput()).coin()).toStr()).toEqual('791007')
    expect(await (await unsignedTxResponse.txBuilder.minFee()).toStr()).toEqual(expectedFee.toString())
  })

  it('Should pick inputs with tokens when using input selection', async () => {
    const utxos: Array<RawUtxo> = await genSampleUtxos()
    const sampleAdaAddresses = await genSampleAdaAddresses()

    const output = new MultiToken(
      [
        {
          // smaller than input
          amount: new BigNumber(1001),
          identifier: defaultIdentifier,
          networkId: NETWORK.NETWORK_ID,
        },
        {
          amount: new BigNumber(1000),
          identifier: testAssetId,
          networkId: NETWORK.NETWORK_ID,
        },
      ],
      {
        defaultIdentifier,
        defaultNetworkId: NETWORK.NETWORK_ID,
      },
    )

    const unsignedTxResponse = await newAdaUnsignedTxFromUtxo(
      [
        {
          address: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
          amount: output,
        },
      ],
      sampleAdaAddresses[0],
      [utxos[0], utxos[1], utxos[2], utxos[3], utxos[4]],
      new BigNumber(0),
      (await getProtocolParams()) as any,
      [],
      [],
      true,
    )
    // input selection will only take 3 of the 5 inputs
    // it takes 2 inputs after which the ADA amount is satisfied
    // then it skips inputs until it found an input  containing the desired token
    const expectedFee = new BigNumber('1614')
    expect(unsignedTxResponse.senderUtxos).toEqual([utxos[0], utxos[1], utxos[4]])
    expect(await (await (await unsignedTxResponse.txBuilder.getExplicitInput()).coin()).toStr()).toEqual('2000703')
    expect(await (await (await unsignedTxResponse.txBuilder.getExplicitOutput()).coin()).toStr()).toEqual('1999089')
    expect(await (await unsignedTxResponse.txBuilder.minFee()).toStr()).toEqual(expectedFee.toString())

    const assetInfo = await identifierToCardanoAsset(testAssetId)

    // current version of flow does not allow method calls in optional chains
    // expect(await (await ((await (await unsignedTxResponse.txBuilder.getExplicitInput()).multiasset())
    //   ?.get(assetInfo.policyId))
    //   ?.get(assetInfo.name))
    //   ?.toStr()
    // ).toEqual('1234')
    let _multiAsset = await (await unsignedTxResponse.txBuilder.getExplicitInput()).multiasset()

    let _assetAmountStr =
      _multiAsset != null
        ? (await _multiAsset.get(assetInfo.policyId)) != null
          ? (await ((await _multiAsset.get(assetInfo.policyId)) as any).get(assetInfo.name)) != null
            ? await (await ((await _multiAsset.get(assetInfo.policyId)) as any).get(assetInfo.name)).toStr()
            : null
          : null
        : null
    expect(_assetAmountStr).toEqual('1234')

    const tx = await unsignedTxResponse.txBuilder.build()
    _multiAsset = await (await (await (await tx.outputs()).get(1)).amount()).multiasset()

    _assetAmountStr =
      _multiAsset != null
        ? (await _multiAsset.get(assetInfo.policyId)) != null
          ? (await ((await _multiAsset.get(assetInfo.policyId)) as any).get(assetInfo.name)) != null
            ? await (await ((await _multiAsset.get(assetInfo.policyId)) as any).get(assetInfo.name)).toStr()
            : null
          : null
        : null
    expect(_assetAmountStr).toEqual('234') // expected change
  })

  it('Should fail when not enough ADA to avoid burning tokens', async () => {
    const utxos: Array<RawUtxo> = await genSampleUtxos()
    const sampleAdaAddresses = await genSampleAdaAddresses()

    const output = new MultiToken(
      [
        {
          // smaller than input
          amount: new BigNumber(900000),
          identifier: defaultIdentifier,
          networkId: NETWORK.NETWORK_ID,
        },
        {
          amount: new BigNumber(1000),
          identifier: testAssetId,
          networkId: NETWORK.NETWORK_ID,
        },
      ],
      {
        defaultIdentifier,
        defaultNetworkId: NETWORK.NETWORK_ID,
      },
    )

    expect.assertions(1)

    await expect(
      newAdaUnsignedTxFromUtxo(
        [
          {
            address: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
            amount: output,
          },
        ],
        sampleAdaAddresses[0],
        [utxos[4]],
        new BigNumber(0),
        {
          ...((await getProtocolParams()) as any),
          // high enough that we can't send the remaining amount as change
          minimumUtxoVal: await BigNum.fromStr('500000'),
        },
        [],
        [],
        true,
      ),
    ).rejects.toThrow(InsufficientFunds)
  })

  it('Should succeed when not enough ADA to avoid burning tokens but is sending all', async () => {
    const utxos: Array<RawUtxo> = await genSampleUtxos()
    await expect(
      sendAllUnsignedTxFromUtxo(
        {
          address: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        },
        [utxos[4]],
        new BigNumber(0),
        {
          ...((await getProtocolParams()) as any),
          // high enough that we can't send the remaining amount as change
          minimumUtxoVal: await BigNum.fromStr('500000'),
        },
        undefined,
      ),
    ).resolves.not.toThrow(InsufficientFunds)
  })

  it('Should fail when insufficient ADA when forcing change', async () => {
    const sampleUtxos = await genSampleUtxos()
    const sampleAdaAddresses = await genSampleAdaAddresses()
    const output = new MultiToken(
      [
        {
          // bigger than input including fees
          amount: new BigNumber(1900001),
          identifier: defaultIdentifier,
          networkId: NETWORK.NETWORK_ID,
        },
      ],
      {
        defaultIdentifier,
        defaultNetworkId: NETWORK.NETWORK_ID,
      },
    )

    await expect(
      newAdaUnsignedTxFromUtxo(
        [
          {
            address: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
            amount: output,
          },
        ],
        sampleAdaAddresses[0],
        [sampleUtxos[4]],
        new BigNumber(0),
        (await getProtocolParams()) as any,
        [],
        [],
        true,
      ),
    ).rejects.toThrow(InsufficientFunds)
  })

  it('Should fail when sending all where sum of tokens > 2^64', async () => {
    const sampleUtxos = await genSampleUtxos()

    await expect(
      sendAllUnsignedTxFromUtxo(
        {
          address: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
        },
        [sampleUtxos[4], sampleUtxos[5]],
        new BigNumber(0),
        (await getProtocolParams()) as any,
        undefined,
      ),
    ).rejects.toThrow(AssetOverflowError)
  })

  it('Should skip inputs when sending where sum of tokens > 2^64', async () => {
    const sampleUtxos = await genSampleUtxos()
    const sampleAdaAddresses = await genSampleAdaAddresses()
    const output = new MultiToken(
      [
        {
          amount: new BigNumber(19001),
          identifier: defaultIdentifier,
          networkId: NETWORK.NETWORK_ID,
        },
      ],
      {
        defaultIdentifier,
        defaultNetworkId: NETWORK.NETWORK_ID,
      },
    )

    const result = await newAdaUnsignedTxFromUtxo(
      [
        {
          address: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
          amount: output,
        },
      ],
      sampleAdaAddresses[0],
      [sampleUtxos[4], sampleUtxos[5]],
      new BigNumber(0),
      (await getProtocolParams()) as any,
      [],
      [],
      true,
    )
    // one of the inputs skipped to keep <= u64
    expect(result.senderUtxos.length).toEqual(1)
  })
})

describe('Create unsigned TX from addresses', () => {
  it('Should create a valid transaction without selection', async () => {
    const addressedUtxos = await genAddressedUtxos()
    const output = new MultiToken(
      [
        {
          // smaller than input
          amount: new BigNumber(5001),
          identifier: defaultIdentifier,
          networkId: NETWORK.NETWORK_ID,
        },
      ],
      {
        defaultIdentifier,
        defaultNetworkId: NETWORK.NETWORK_ID,
      },
    )
    const unsignedTxResponse = await newAdaUnsignedTx(
      [
        {
          address: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
          amount: output,
        },
      ],
      undefined,
      [addressedUtxos[0], addressedUtxos[1]],
      new BigNumber(0),
      (await getProtocolParams()) as any,
      [],
      [],
      true,
    )
    expect(unsignedTxResponse.senderUtxos).toEqual([addressedUtxos[0], addressedUtxos[1]])

    expect(await (await (await unsignedTxResponse.txBuilder.getExplicitInput()).coin()).toStr()).toEqual('1000702')
    expect(await ((await unsignedTxResponse.txBuilder.getExplicitOutput()).coin() as any).toStr()).toEqual('5001')
    expect(await (await unsignedTxResponse.txBuilder.minFee()).toStr()).toEqual('1064')
    // burns remaining amount
    expect(
      await (
        await (
          await (
            await unsignedTxResponse.txBuilder.getExplicitInput()
          ).checkedSub(await unsignedTxResponse.txBuilder.getExplicitOutput())
        ).coin()
      ).toStr(),
    ).toEqual(await (await (await unsignedTxResponse.txBuilder.build()).fee()).toStr())
  })
})

describe('Create signed transactions', () => {
  it('Witness should match on valid private key', async () => {
    const addressedUtxos = await genAddressedUtxos()

    const output = new MultiToken(
      [
        {
          // smaller than input
          amount: new BigNumber(5001),
          identifier: defaultIdentifier,
          networkId: NETWORK.NETWORK_ID,
        },
      ],
      {
        defaultIdentifier,
        defaultNetworkId: NETWORK.NETWORK_ID,
      },
    )
    const unsignedTxResponse = await newAdaUnsignedTx(
      [
        {
          address: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
          amount: output,
        },
      ],
      undefined,
      [addressedUtxos[0], addressedUtxos[1]],
      new BigNumber(0),
      (await getProtocolParams()) as any,
      [],
      [],
      true,
    )

    const accountPrivateKey = await Bip32PrivateKey.fromBytes(
      Buffer.from(
        '70afd5ff1f7f551c481b7e3f3541f7c63f5f6bcb293af92565af3deea0bcd6481a6e7b8acbe38f3906c63ccbe8b2d9b876572651ac5d2afc0aca284d9412bb1b4839bf02e1d990056d0f06af22ce4bcca52ac00f1074324aab96bbaaaccf290d',
        'hex',
      ),
    )
    const signedTx = await signTransaction(
      unsignedTxResponse.senderUtxos,
      unsignedTxResponse.txBuilder,
      NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
      accountPrivateKey,
      new Set(),
      undefined,
    )
    const witnesses = await (signedTx as any).witness_set()

    expect(await witnesses.vkeys()).toEqual(undefined)
    expect(await witnesses.scripts()).toEqual(undefined)
    const bootstrapWits = await witnesses.bootstraps()
    if (bootstrapWits == null) {
      throw new Error('Bootstrap witnesses should not be null')
    }
    expect(await bootstrapWits.len()).toEqual(1)

    expect(Buffer.from(await (await bootstrapWits.get(0)).toBytes()).toString('hex')).toEqual(
      '8458208fb03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbfd8800b51c05840d4da0fe3615f90581926281be0510df5f6616ebed5a6d6831cceab4dd9935f7f5b6150d43b918d79e8db7cd3e17b9de91fdfbaed7cdab18818331942852fd10b58202623fceb96b07408531a5cb259f53845a38d6b68928e7c0c7e390f07545d0e6241a0',
    )
  })

  it('Witness should match with addressing from root', async () => {
    const accountPrivateKey = await Bip32PrivateKey.fromBytes(
      Buffer.from(
        '70afd5ff1f7f551c481b7e3f3541f7c63f5f6bcb293af92565af3deea0bcd6481a6e7b8acbe38f3906c63ccbe8b2d9b876572651ac5d2afc0aca284d9412bb1b4839bf02e1d990056d0f06af22ce4bcca52ac00f1074324aab96bbaaaccf290d',
        'hex',
      ),
    )
    const inputs = await (TransactionInputs as any).new()
    await inputs.add(
      await TransactionInput.new(
        await TransactionHash.fromBytes(
          Buffer.from('05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f', 'hex'),
        ),
        0,
      ),
    )
    await inputs.add(
      await TransactionInput.new(
        await TransactionHash.fromBytes(
          Buffer.from('6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe', 'hex'),
        ),
        0,
      ),
    )
    const outputs = await (TransactionOutputs as any).new()
    await outputs.add(
      await TransactionOutput.new(
        await Address.fromBytes(
          Buffer.from(await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'), 'hex'),
        ),
        await Value.new(await BigNum.fromStr('5001')),
      ),
    )
    const txBody = await (TransactionBody as any).new(inputs, outputs, await BigNum.fromStr('1000'), 0)
    const signedTx = await signTransaction(
      [
        {
          amount: '7001',
          receiver: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
          tx_hash: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f',
          tx_index: 0,
          utxo_id: '05ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f0',
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
          assets: [],
        },
        {
          amount: '1000001',
          receiver: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
          tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
          tx_index: 0,
          utxo_id: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
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
          assets: [],
        },
      ],
      txBody,
      NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
      accountPrivateKey,
      new Set(),
      undefined,
    )

    const witnesses = await (signedTx as any).witness_set()

    expect(await witnesses.vkeys()).toEqual(undefined)
    expect(await witnesses.scripts()).toEqual(undefined)
    const bootstrapWits = await witnesses.bootstraps()
    if (bootstrapWits == null) {
      throw new Error('Bootstrap witnesses should not be null')
    }
    // note: only one witness since we got rid of duplicates
    expect(await bootstrapWits.len()).toEqual(1)

    expect(Buffer.from(await (await bootstrapWits.get(0)).toBytes()).toString('hex')).toEqual(
      '8458208fb03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbfd8800b51c058401edebb108c74a991bef5b28458778fc0713499349d77fb98acc63e4219cfcd1b51321ccaccdf2ce2e80d7c2687f3d79feea32daedcfbc19792dff0358af5950358202623fceb96b07408531a5cb259f53845a38d6b68928e7c0c7e390f07545d0e6241a0',
    )
  })

  it('Transaction should support certificates', async () => {
    const accountPrivateKey = await Bip32PrivateKey.fromBytes(
      Buffer.from(
        '408a1cb637d615c49e8696c30dd54883302a20a7b9b8a9d1c307d2ed3cd50758c9402acd000461a8fc0f25728666e6d3b86d031b8eea8d2f69b21e8aa6ba2b153e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
        'hex',
      ),
    )
    const stakingKey = await (await (await accountPrivateKey.derive(2)).derive(NUMBERS.STAKING_KEY_INDEX)).toRawKey()

    const addressedUtxos = await genAddressedUtxos()

    const output = new MultiToken(
      [
        {
          // smaller than input
          amount: new BigNumber(5001),
          identifier: defaultIdentifier,
          networkId: NETWORK.NETWORK_ID,
        },
      ],
      {
        defaultIdentifier,
        defaultNetworkId: NETWORK.NETWORK_ID,
      },
    )
    const unsignedTxResponse = await newAdaUnsignedTx(
      [
        {
          address: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
          amount: output,
        },
      ],
      undefined,
      [addressedUtxos[3]],
      new BigNumber(0),
      await getProtocolParams(),
      [
        await Certificate.newStakeRegistration(
          await StakeRegistration.new(await StakeCredential.fromKeyhash(await (await stakingKey.toPublic()).hash())),
        ),
        await Certificate.newStakeDelegation(
          await StakeDelegation.new(
            await StakeCredential.fromKeyhash(await (await stakingKey.toPublic()).hash()),
            await Ed25519KeyHash.fromBytes(
              Buffer.from('1b268f4cba3faa7e36d8a0cc4adca2096fb856119412ee7330f692b5', 'hex'),
            ),
          ),
        ),
      ],
      [],
      true,
    )
    const signedTx = await signTransaction(
      unsignedTxResponse.senderUtxos,
      unsignedTxResponse.txBuilder,
      NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
      accountPrivateKey,
      new Set([
        Buffer.from(
          await (
            await makeVkeyWitness(await hashTransaction(await unsignedTxResponse.txBuilder.build()), stakingKey)
          ).toBytes(),
        ).toString('hex'),
      ]),
      undefined,
    )
    const witnesses = await (signedTx as any).witness_set()

    const vKeyWits = await witnesses.vkeys()
    if (vKeyWits == null) throw new Error('Vkey witnesses should not be null')
    expect(await vKeyWits.len()).toEqual(2)
    expect(await witnesses.scripts()).toEqual(undefined)
    expect(await witnesses.bootstraps()).toEqual(undefined)

    // set is used so order not defined so we sort the list
    const witArray = [
      Buffer.from(await (await vKeyWits.get(0)).toBytes()).toString('hex'),
      Buffer.from(await (await vKeyWits.get(1)).toBytes()).toString('hex'),
    ].sort()

    expect(witArray).toEqual([
      '82582001c01f8b958699ae769a246e9785db5a70e023977ea4b856dfacf23c23346caf58401b10a18433be709391e70a82c4de91d1c8b3cb27dfa7c7d19a247a4dfe5dea437a0ebefe3ced5f6f7ad2bc79b11c5556614f8bec19b87fc5145a13edc3ae320f',
      '82582038c14a0756e1743081a8ebfdb9169b11283a7bf6c38045c4c4a5e62a7689639d58403a56ed05738ec98589a1263281bfd33ec5f0bed3f90eafced8ed8652be65f3327487cb487dde0d26ca9a7ce568a4c05367630baec47a5d771ba7b184161b100d',
    ])
  })

  it('Transaction should support withdrawals', async () => {
    const accountPrivateKey = await Bip32PrivateKey.fromBytes(
      Buffer.from(
        '408a1cb637d615c49e8696c30dd54883302a20a7b9b8a9d1c307d2ed3cd50758c9402acd000461a8fc0f25728666e6d3b86d031b8eea8d2f69b21e8aa6ba2b153e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
        'hex',
      ),
    )
    const stakingKey = await (await (await accountPrivateKey.derive(2)).derive(NUMBERS.STAKING_KEY_INDEX)).toRawKey()
    const stakingKeyCredential = await StakeCredential.fromKeyhash(await (await stakingKey.toPublic()).hash())

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
      [await Certificate.newStakeDeregistration(await StakeDeregistration.new(stakingKeyCredential))],
      [
        {
          address: await RewardAddress.new(Number.parseInt(NETWORK.CHAIN_NETWORK_ID, 10), stakingKeyCredential),
          amount: await BigNum.fromStr(withdrawAmount),
        },
      ],
      true,
    )
    const signedTx = await signTransaction(
      unsignedTxResponse.senderUtxos,
      unsignedTxResponse.txBuilder,
      NUMBERS.BIP44_DERIVATION_LEVELS.ACCOUNT,
      accountPrivateKey,
      new Set([
        Buffer.from(
          await (
            await makeVkeyWitness(await hashTransaction(await unsignedTxResponse.txBuilder.build()), stakingKey)
          ).toBytes(),
        ).toString('hex'),
      ]),
      undefined,
    )
    const witnesses = await (signedTx as any).witness_set()

    const vKeyWits = await witnesses.vkeys()
    if (vKeyWits == null) throw new Error('Vkey witnesses should not be null')
    expect(await vKeyWits.len()).toEqual(2)
    expect(await witnesses.scripts()).toEqual(undefined)
    expect(await witnesses.bootstraps()).toEqual(undefined)

    const txBody = await unsignedTxResponse.txBuilder.build()
    const withdrawals = await txBody.withdrawals()
    if (withdrawals == null) throw new Error('Withdrawals should not be null')
    expect(await withdrawals.len()).toEqual(1)
    const fee = await (await txBody.fee()).toStr()
    expect(fee).toEqual('1302')
    expect(await (await txBody.outputs()).len()).toEqual(1)
    expect(await (await (await (await (await txBody.outputs()).get(0)).amount()).coin()).toStr()).toEqual(
      new BigNumber(addressedUtxos[3].amount)
        .minus(fee)
        .plus(withdrawAmount)
        .plus(await protocolParams.keyDeposit.toStr())
        .toString(),
    )

    // set is used so order not defined so we sort the list
    const witArray = [
      Buffer.from(await (await vKeyWits.get(0)).toBytes()).toString('hex'),
      Buffer.from(await (await vKeyWits.get(1)).toBytes()).toString('hex'),
    ].sort()

    expect(witArray).toEqual([
      '82582001c01f8b958699ae769a246e9785db5a70e023977ea4b856dfacf23c23346caf5840d684b2ee3f8959eb76024280903236edebb244e41c16bafca05d0a30669c7e9df19c3896002c976d8734e25a64d7273b5b58400102fffeb4f858a81f191c8204',
      '82582038c14a0756e1743081a8ebfdb9169b11283a7bf6c38045c4c4a5e62a7689639d5840168146e19cf1074036b48b0ba6b26f9ff08cd2e6fa381f84480e9c8c9fb582a5c8d85062e62809143b1c0edc4b9412b5504f78f3de6413386a0088d302d2b301',
    ])
  })
})

describe('Create sendAll unsigned TX from UTXO', () => {
  it('Create a transaction involving all input with no change', async () => {
    const sampleUtxos = await genSampleUtxos()
    const utxos: Array<RawUtxo> = [sampleUtxos[1], sampleUtxos[2]]
    const sendAllResponse = await sendAllUnsignedTxFromUtxo(
      {
        address: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
      },
      utxos,
      new BigNumber(0),
      (await getProtocolParams()) as any,
    )
    const expectedFee = new BigNumber('1342')
    const expectedInput = new BigNumber('11000002')

    expect(sendAllResponse.senderUtxos).toEqual([utxos[0], utxos[1]])
    expect(await (await (await sendAllResponse.txBuilder.getExplicitInput()).coin()).toStr()).toEqual(
      expectedInput.toString(),
    )
    expect(await (await (await sendAllResponse.txBuilder.getExplicitOutput()).coin()).toStr()).toEqual(
      expectedInput.minus(expectedFee).toString(),
    )
    expect(await (await sendAllResponse.txBuilder.minFee()).toStr()).toEqual(expectedFee.toString())
    // make sure we don't accidentally burn a lot of coins
    expect(
      await (
        await (
          await (
            await sendAllResponse.txBuilder.getExplicitInput()
          ).checkedSub(await sendAllResponse.txBuilder.getExplicitOutput())
        ).coin()
      ).toStr(),
    ).toEqual(expectedFee.toString())
  })

  it('Should fail due to insufficient funds (no inputs)', async () => {
    const promise = sendAllUnsignedTxFromUtxo(
      {
        address: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
      },
      [],
      new BigNumber(0),
      (await getProtocolParams()) as any,
    )
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })

  it('Should fail due to insufficient funds (not enough to cover fees)', async () => {
    const sampleUtxos = await genSampleUtxos()
    const utxos: Array<RawUtxo> = [sampleUtxos[0]]
    const promise = sendAllUnsignedTxFromUtxo(
      {
        address: await byronAddrToHex('Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'),
      },
      utxos,
      new BigNumber(0),
      (await getProtocolParams()) as any,
    )
    await expect(promise).rejects.toThrow(InsufficientFunds)
  })
})
