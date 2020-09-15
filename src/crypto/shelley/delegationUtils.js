// @flow

import {BigNumber} from 'bignumber.js'
import {
  Address,
  BaseAddress,
  BigNum,
  Certificate,
  Ed25519KeyHash,
  LinearFee,
  PublicKey,
  RewardAddress,
  StakeCredential,
  StakeDelegation,
  StakeDeregistration,
  StakeRegistration,
} from 'react-native-haskell-shelley'
import {sortBy} from 'lodash'

import {newAdaUnsignedTx} from './transactions'
import {normalizeToAddress} from './utils'
import {NETWORKS} from '../../config/networks'
import {Logger} from '../../utils/logging'
import {CardanoError, InsufficientFunds} from '../errors'
import {ObjectValues} from '../../utils/flow'
import assert from '../../utils/assert'
import {HaskellShelleyTxSignRequest} from './HaskellShelleyTxSignRequest'

import type {
  Addressing,
  AddressedUtxo,
  V4UnsignedTxAddressedUtxoResponse,
} from '../types'
import type {TimestampedCertMeta} from './transactionCache'
import type {Dict} from '../../state'

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

export const filterAddressesByStakingKey = async (
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
  const stakeCredential = await StakeCredential.from_keyhash(
    await stakingKey.hash(),
  )

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
  registrationStatus: boolean,
  poolRequest: void | string,
  valueInAccount: BigNumber,
  addressedUtxos: Array<AddressedUtxo>,
  stakingKey: PublicKey,
  changeAddr: {address: string, ...Addressing},
|}

export type CreateDelegationTxResponse = {|
  signTxRequest: HaskellShelleyTxSignRequest,
  totalAmountToDelegate: BigNumber,
|}

export const createDelegationTx = async (
  request: CreateDelegationTxRequest,
): Promise<CreateDelegationTxResponse> => {
  Logger.debug('delegationUtils::createDelegationTx called', request)
  const {
    changeAddr,
    registrationStatus,
    addressedUtxos,
    absSlotNumber,
    stakingKey,
    poolRequest,
  } = request
  try {
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
      registrationStatus,
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
      [], // no withdrawals
      false,
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

    const signTxRequest = new HaskellShelleyTxSignRequest(
      {
        senderUtxos: unsignedTx.senderUtxos,
        unsignedTx: unsignedTx.txBuilder,
        changeAddr: unsignedTx.changeAddr,
        certificate: undefined,
      },
      undefined,
      {
        ChainNetworkId: Number.parseInt(config.CHAIN_NETWORK_ID, 10),
        KeyDeposit: new BigNumber(config.KEY_DEPOSIT),
        PoolDeposit: new BigNumber(config.POOL_DEPOSIT),
      },
      {
        neededHashes: new Set([
          Buffer.from(
            await (await StakeCredential.from_keyhash(
              await stakingKey.hash(),
            )).to_bytes(),
          ).toString('hex'),
        ]),
        wits: new Set(),
      },
    )
    return {
      signTxRequest,
      totalAmountToDelegate,
    }
  } catch (e) {
    if (e instanceof InsufficientFunds) throw e
    Logger.error(`shelley::createDelegationTx:: ${e.message}`, e)
    throw new CardanoError(e.message)
  }
}

export const unwrapStakingKey = async (
  stakingAddress: string,
): Promise<StakeCredential> => {
  const accountAddress = await RewardAddress.from_address(
    await Address.from_bytes(Buffer.from(stakingAddress, 'hex')),
  )
  if (accountAddress == null) {
    throw new Error('unwrapStakingKe: staking key invalid')
  }
  const stakingKey = await accountAddress.payment_cred()

  return stakingKey
}

export const getUtxoDelegatedBalance = async (
  allUtxo: $ReadOnlyArray<$ReadOnly<AddressedUtxo>>,
  stakingAddress: string,
): Promise<BigNumber> => {
  // TODO: need to also deal with pointer address summing
  // can get most recent pointer from getCurrentDelegation result

  const stakingKey = await unwrapStakingKey(stakingAddress)
  const allUtxosForKey = await filterAddressesByStakingKey(
    stakingKey,
    allUtxo,
    false,
  )
  const utxoSum = allUtxosForKey.reduce(
    (sum, utxo) => sum.plus(new BigNumber(utxo.amount)),
    new BigNumber(0),
  )

  return utxoSum
}

export type DelegationStatus = {|
  +isRegistered: boolean,
  +poolKeyHash: ?string,
|}
export const getDelegationStatus = (
  rewardAddress: string,
  txCertificatesForKey: Dict<TimestampedCertMeta>, // key is txId
): DelegationStatus => {
  let isRegistered = false
  let poolKeyHash = null
  if (txCertificatesForKey == null) {
    return {
      isRegistered,
      poolKeyHash,
    }
  }
  // start with older certificate
  const sortedCerts = sortBy(
    txCertificatesForKey,
    (txCerts) => txCerts.submittedAt,
  )
  Logger.debug('txCertificatesForKey', sortedCerts)

  for (const certData of ObjectValues(sortedCerts)) {
    const certificates = certData.certificates
    for (const cert of certificates) {
      if (cert.rewardAddress !== rewardAddress) continue
      if (cert.kind === 'StakeDelegation') {
        assert.assert(
          cert.poolKeyHash != null,
          'getDelegationStatus:: StakeDelegation certificate without poolKeyHash',
        )
        poolKeyHash = cert.poolKeyHash
        isRegistered = true
      } else if (
        cert.kind === 'StakeRegistration' ||
        cert.kind === 'MoveInstantaneousRewardsCert'
      ) {
        isRegistered = true
      } else if (cert.kind === 'StakeDeregistration') {
        isRegistered = false
      }
    }
  }
  return {
    isRegistered,
    poolKeyHash,
  }
}
