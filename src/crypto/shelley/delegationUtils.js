// @flow

import {BigNumber} from 'bignumber.js'
import {
  BaseAddress,
  BigNum,
  Certificate,
  Ed25519KeyHash,
  LinearFee,
  PublicKey,
  StakeCredential,
  StakeDelegation,
  StakeDeregistration,
  StakeRegistration,
  TransactionBuilder,
} from 'react-native-haskell-shelley'

import {newAdaUnsignedTx} from './transactions'
import {normalizeToAddress} from './utils'
import {NETWORKS} from '../../config/networks'
import {Logger} from '../../utils/logging'
import {CardanoError} from '../errors'

import type {
  Addressing,
  AddressedUtxo,
  BaseSignRequest,
  V4UnsignedTxAddressedUtxoResponse,
} from '../types'

const createCertificate = async (
  stakingKey: PublicKey,
  isRegistered: boolean,
  poolRequest: void | string,
): Promise<Array<Certificate>> => {
  const credential = await StakeCredential.from_keyhash(await stakingKey.hash())
  if (poolRequest == null) {
    if (isRegistered) {
      return [
        await Certificate.new_stake_deregistration(
          await StakeDeregistration.new(credential),
        ),
      ]
    }
    return [] // no need to undelegate if no staking key registered
  }
  const result = []
  if (!isRegistered) {
    // if unregistered, need to register first
    result.push(
      await Certificate.new_stake_registration(
        await StakeRegistration.new(credential),
      ),
    )
  }
  result.push(
    await Certificate.new_stake_delegation(
      await StakeDelegation.new(
        credential,
        await Ed25519KeyHash.from_bytes(Buffer.from(poolRequest, 'hex')),
      ),
    ),
  )
  return result
}

const addrContainsAccountKey = async (
  address: string,
  targetAccountKey: StakeCredential,
  acceptTypeMismatch: boolean,
): Promise<boolean> => {
  const wasmAddr = await normalizeToAddress(address)
  if (wasmAddr == null) {
    throw new Error(`addrContainsAccountKey: invalid address ${address}`)
  }
  const accountKeyString = Buffer.from(
    await targetAccountKey.to_bytes(),
  ).toString('hex')

  const asBase = await BaseAddress.from_address(wasmAddr)
  if (asBase != null) {
    if (
      Buffer.from(await (await asBase.stake_cred()).to_bytes()).toString(
        'hex',
      ) === accountKeyString
    ) {
      return true
    }
  }
  // TODO(v-almonacid): PointerAddress not yet implemented
  // const asPointer = await PointerAddress.from_address(wasmAddr);
  // if (asPointer != null) {
  //   // TODO
  // }
  return acceptTypeMismatch
}

const filterAddressesByStakingKey = async (
  stakingKey: StakeCredential,
  utxos: $ReadOnlyArray<$ReadOnly<AddressedUtxo>>,
  acceptTypeMismatch: boolean,
): Promise<$ReadOnlyArray<$ReadOnly<AddressedUtxo>>> => {
  const result = []
  for (const utxo of utxos) {
    if (
      await addrContainsAccountKey(
        utxo.receiver,
        stakingKey,
        acceptTypeMismatch,
      )
    ) {
      result.push(utxo)
    }
  }
  return result
}

/**
 * Sending the transaction may affect the amount delegated in a few ways:
 * 1) The transaction fee for the transaction
 *  - may be paid with UTXO that either does or doesn't belong to our staking key.
 * 2) The change for the transaction
 *  - may get turned into a group address for our staking key
 */
const getDifferenceAfterTx = async (
  utxoResponse: V4UnsignedTxAddressedUtxoResponse,
  allUtxos: Array<AddressedUtxo>,
  stakingKey: PublicKey,
): Promise<BigNumber> => {
  const stakeCredential = await StakeCredential.from_keyhash(stakingKey.hash())

  let sumInForKey = new BigNumber(0)
  {
    // note senderUtxos.length is approximately 1
    // since it's just to cover transaction fees
    // so this for loop is faster than building a map
    for (const senderUtxo of utxoResponse.senderUtxos) {
      const match = allUtxos.find(
        (utxo) =>
          utxo.tx_hash === senderUtxo.tx_hash &&
          utxo.tx_index === senderUtxo.tx_index,
      )
      if (match == null) {
        throw new Error(
          'getDifferenceAfterTx: utxo not found. Should not happen',
        )
      }
      const address = match.receiver
      if (await addrContainsAccountKey(address, stakeCredential, true)) {
        sumInForKey = sumInForKey.plus(new BigNumber(senderUtxo.amount))
      }
    }
  }

  let sumOutForKey = new BigNumber(0)
  {
    const txBody = await utxoResponse.txBuilder.build()
    const outputs = await txBody.outputs()
    for (let i = 0; i < (await outputs.len()); i++) {
      const output = await outputs.get(i)
      const address = Buffer.from(
        await (await output.address()).to_bytes(),
      ).toString('hex')
      if (await addrContainsAccountKey(address, stakeCredential, true)) {
        const value = new BigNumber(await (await output.amount()).to_str())
        sumOutForKey = sumOutForKey.plus(value)
      }
    }
  }

  return sumOutForKey.minus(sumInForKey)
}

export type CreateDelegationTxRequest = {|
  absSlotNumber: BigNumber,
  // computeRegistrationStatus: (void) => Promise<boolean>,
  registrationStatus: boolean,
  poolRequest: void | string,
  valueInAccount: BigNumber,
  addressedUtxos: Array<AddressedUtxo>,
  stakingKey: PublicKey,
  changeAddr: {address: string, ...Addressing},
|}
// TODO(v-almonacid): we cannot yet implement HaskellShelleyTxSignRequest
// because there are still some bindings missing
// export type CreateDelegationTxResponse = {|
//   signTxRequest: HaskellShelleyTxSignRequest,
//   totalAmountToDelegate: BigNumber,
// |}
export type CreateDelegationTxResponse = {|
  signTxRequest: BaseSignRequest<TransactionBuilder>,
  totalAmountToDelegate: BigNumber,
|}

export const createDelegationTx = async (
  request: CreateDelegationTxRequest,
): Promise<CreateDelegationTxResponse> => {
  Logger.debug('delegationUtils::createDelegationTx called')
  const {
    changeAddr,
    addressedUtxos,
    absSlotNumber,
    stakingKey,
    poolRequest,
  } = request
  try {
    // const registrationStatus = await request.computeRegistrationStatus()

    const config = NETWORKS.HASKELL_SHELLEY
    const protocolParams = {
      keyDeposit: await BigNum.from_str(config.KEY_DEPOSIT),
      linearFee: await LinearFee.new(
        await BigNum.from_str(config.LINEAR_FEE.COEFFICIENT),
        await BigNum.from_str(config.LINEAR_FEE.CONSTANT),
      ),
      minimumUtxoVal: await BigNum.from_str(config.MINIMUM_UTXO_VAL),
      poolDeposit: await BigNum.from_str(config.POOL_DEPOSIT),
    }

    const stakeDelegationCert = await createCertificate(
      stakingKey,
      request.registrationStatus,
      poolRequest,
    )
    const unsignedTx = await newAdaUnsignedTx(
      [],
      {
        address: changeAddr.address,
        addressing: changeAddr.addressing,
      },
      addressedUtxos,
      absSlotNumber,
      protocolParams,
      stakeDelegationCert,
      // [], // TODO
    )

    const allUtxosForKey = await filterAddressesByStakingKey(
      await StakeCredential.from_keyhash(await stakingKey.hash()),
      addressedUtxos,
      false,
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
      .plus(request.valueInAccount) // recall: rewards are compounding

    const signTxRequest = {
      senderUtxos: unsignedTx.senderUtxos,
      unsignedTx: unsignedTx.txBuilder,
      changeAddr: unsignedTx.changeAddr,
      certificate: undefined,
    }

    // TODO(v-almonacid): we cannot yet implement HaskellShelleyTxSignRequest
    // because there are still some bindings missing

    // const signTxRequest = new HaskellShelleyTxSignRequest(
    //   {
    //     senderUtxos: unsignedTx.senderUtxos,
    //     unsignedTx: unsignedTx.txBuilder,
    //     changeAddr: unsignedTx.changeAddr,
    //     certificate: undefined,
    //   },
    //   undefined,
    //   {
    //     ChainNetworkId: Number.parseInt(config.ChainNetworkId, 10),
    //     KeyDeposit: new BigNumber(config.KeyDeposit),
    //     PoolDeposit: new BigNumber(config.PoolDeposit),
    //   },
    //   {
    //     neededHashes: new Set([
    //       Buffer.from(
    //         await StakeCredential.from_keyhash(stakingKey.hash()).to_bytes(),
    //       ).toString('hex'),
    //     ]),
    //     wits: new Set(),
    //   },
    // )
    return {
      signTxRequest,
      totalAmountToDelegate,
    }
  } catch (e) {
    Logger.error(`shelley::createDelegationTx:: ${e.message}`, e)
    throw new CardanoError(e.message)
  }
}
