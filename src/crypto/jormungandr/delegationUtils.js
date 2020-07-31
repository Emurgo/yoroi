// @flow
import {BigNumber} from 'bignumber.js'

import {
  Address,
  AddressKind,
  Bip32PrivateKey,
  Certificate,
  DelegationType,
  StakeDelegation,
  PoolId,
  PrivateKey,
  PublicKey,
} from 'react-native-chain-libs'
import {
  newAdaUnsignedTx,
  signTransaction,
} from './transactions/utxoTransactions'

import type {
  AddressedUtxo,
  Addressing,
  V3SignedTx,
  V3UnsignedTxAddressedUtxoData,
} from '../../types/HistoryTransaction'
import {Logger} from '../../utils/logging'

// note(v-almonacid): ratio delegation won't be supported for now

export type PoolData = void | {|id: string|}

export type DelegationTxData = {|
  unsignedTx: V3UnsignedTxAddressedUtxoData,
  totalAmountToDelegate: BigNumber,
|}

export const createCertificate = async (
  stakingKey: PublicKey,
  poolData: PoolData,
  valueInAccount: number,
): Promise<StakeDelegation> => {
  if (poolData == null) {
    return await StakeDelegation.new(
      await DelegationType.non_delegated(),
      stakingKey,
    )
  }
  return await StakeDelegation.new(
    await DelegationType.full(await PoolId.from_hex(poolData.id)),
    stakingKey,
  )
}

export const groupAddrContainsAccountKey = async (
  address: string,
  targetAccountKey: string,
): Promise<boolean> => {
  const wasmAddr = await Address.from_bytes(Buffer.from(address, 'hex'))
  if ((await wasmAddr.get_kind()) !== (await AddressKind.Group)) {
    return false
  }
  const groupKey = await wasmAddr.to_group_address()
  if (groupKey == null) return false
  const accountKey = await groupKey.get_account_key()
  const accountKeyString = Buffer.from(await accountKey.as_bytes()).toString(
    'hex',
  )
  return targetAccountKey === accountKeyString
}

export const filterAddressesByStakingKey = async (
  stakingKey: PublicKey,
  utxos: Array<AddressedUtxo>,
): Promise<Array<AddressedUtxo>> => {
  const stakingKeyString = Buffer.from(await stakingKey.as_bytes()).toString(
    'hex',
  )
  const result = []
  for (const utxo of utxos) {
    if (await groupAddrContainsAccountKey(utxo.receiver, stakingKeyString)) {
      result.push(utxo)
    }
  }
  return result
}

/* Sending the transaction may affect the amount delegated in a few ways:
 * 1) The transaction fee for the transaction
 *  - may be paid with UTXO that either does or doesn't belong to our staking key.
 * 2) The change for the transaction
 *  - may get turned into a group address for our staking key
 */
export const getDifferenceAfterTx = async (
  utxoResponse: V3UnsignedTxAddressedUtxoData,
  addressedUtxos: Array<AddressedUtxo>,
  stakingKey: PublicKey,
): Promise<BigNumber> => {
  const stakingKeyString = Buffer.from(await stakingKey.as_bytes()).toString(
    'hex',
  )

  let sumInForKey = new BigNumber(0)
  {
    // note senderUtxos.length is approximately 1
    // since it's just to cover transaction fees
    // so this for loop is faster than building a map
    for (const senderUtxo of utxoResponse.senderUtxos) {
      const match = addressedUtxos.find(
        (utxo) =>
          utxo.tx_hash === senderUtxo.tx_hash &&
          utxo.tx_index === senderUtxo.tx_index,
      )
      if (match == null) {
        throw new Error(
          'getDifferenceAfterTx:: utxo not found. Should not happen',
        )
      }
      const address = match.receiver
      if (await groupAddrContainsAccountKey(address, stakingKeyString)) {
        sumInForKey = sumInForKey.plus(new BigNumber(senderUtxo.amount))
      }
    }
  }

  let sumOutForKey = new BigNumber(0)
  {
    const outputs = await utxoResponse.IOs.outputs()
    for (let i = 0; i < (await outputs.size()); i++) {
      const output = await outputs.get(i)
      const address = Buffer.from(
        await (await output.address()).as_bytes(),
      ).toString('hex')
      if (await groupAddrContainsAccountKey(address, stakingKeyString)) {
        const value = new BigNumber(await (await output.value()).to_str())
        sumOutForKey = sumOutForKey.plus(value)
      }
    }
  }

  return sumOutForKey.minus(sumInForKey)
}

export const createDelegationTx = async (
  poolData: PoolData,
  valueInAccount: number,
  addressedUtxos: Array<AddressedUtxo>,
  stakingKey: PublicKey,
  changeAddress: {|address: string, ...Addressing|},
): Promise<DelegationTxData> => {
  const stakeDelegationCert = await createCertificate(
    stakingKey,
    poolData,
    valueInAccount,
  )
  const certificate = await Certificate.stake_delegation(stakeDelegationCert)

  const unsignedTx = await newAdaUnsignedTx(
    [], // no outputs
    [
      {
        address: changeAddress.address,
        addressing: changeAddress.addressing,
      },
    ],
    addressedUtxos,
    certificate,
  )

  const allUtxosForKey = await filterAddressesByStakingKey(
    stakingKey,
    addressedUtxos,
  )
  const utxoSum = allUtxosForKey.reduce(
    (sum, utxo) => sum.plus(new BigNumber(utxo.amount)),
    new BigNumber(0),
  )

  const differenceAfterTx = await getDifferenceAfterTx(
    unsignedTx,
    addressedUtxos,
    stakingKey,
  )

  const totalAmountToDelegate = utxoSum
    .plus(differenceAfterTx) // subtract any part of the fee that comes from UTXO
    .plus(valueInAccount) // recall: Jormungandr rewards are compounding

  return {
    unsignedTx,
    totalAmountToDelegate,
  }
}

export const signDelegationTx = async (
  unsignedDelegationTx: V3UnsignedTxAddressedUtxoData,
  signingKey: Bip32PrivateKey,
  stakingKey: PrivateKey,
): Promise<V3SignedTx> => {
  const {certificate, changeAddr, senderUtxos, IOs} = unsignedDelegationTx
  try {
    if (certificate == null) {
      throw new Error('signDelegationTx: missing certificate')
    }
    const signedTx = await signTransaction(
      {
        senderUtxos,
        changeAddr,
        certificate,
        IOs,
      },
      signingKey,
      // Note: always false because we should only do legacy txs for wallet transfers
      false,
      {
        stakingKey,
        certificate,
      },
    )

    const id = Buffer.from(await (await signedTx.id()).as_bytes()).toString(
      'hex',
    )
    const encodedTx = await signedTx.as_bytes()

    return {
      id,
      encodedTx,
    }
  } catch (error) {
    Logger.error(`signDelegationTx error: ${error}`)
    throw error
  }
}
