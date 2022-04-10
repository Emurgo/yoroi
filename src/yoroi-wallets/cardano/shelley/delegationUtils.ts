/* eslint-disable camelcase */
import {
  Address,
  BaseAddress,
  BigNum,
  Certificate,
  Ed25519KeyHash,
  hash_transaction,
  LinearFee,
  make_vkey_witness,
  PrivateKey,
  PublicKey,
  RewardAddress,
  StakeCredential,
  StakeDelegation,
  StakeDeregistration,
  StakeRegistration,
} from '@emurgo/react-native-haskell-shelley'
import {BigNumber} from 'bignumber.js'
import ExtendableError from 'es6-error'
import {sortBy} from 'lodash'

import type {AccountStateRequest, AccountStateResponse} from '../../../../legacy/api/types'
import type {CardanoHaskellShelleyNetwork} from '../../../../legacy/config/networks'
import type {BackendConfig} from '../../../../legacy/config/types'
import {CardanoError, InsufficientFunds, RewardAddressEmptyError} from '../../../../legacy/crypto/errors'
import {normalizeToAddress} from '../../../../legacy/crypto/shelley/utils'
import type {AddressedUtxo, Addressing, V4UnsignedTxAddressedUtxoResponse} from '../../../../legacy/crypto/types'
import LocalizableError from '../../../../legacy/i18n/LocalizableError'
import type {DefaultAsset} from '../../../../legacy/types/HistoryTransaction'
import assert from '../../../../legacy/utils/assert'
import {ObjectValues} from '../../../../legacy/utils/flow'
import {Logger} from '../../../../legacy/utils/logging'
import {StakingStatus} from '../../../types'
// $FlowExpectedError
import {HaskellShelleyTxSignRequest, MultiToken} from '../..'
import type {TimestampedCertMeta} from './transactionCache'
import {newAdaUnsignedTx} from './transactions'

const createCertificate = async (
  stakingKey: PublicKey,
  isRegistered: boolean,
  poolRequest: void | string,
): Promise<Array<Certificate>> => {
  const credential = await StakeCredential.from_keyhash(await stakingKey.hash())

  if (poolRequest == null) {
    if (isRegistered) {
      return [await Certificate.new_stake_deregistration(await StakeDeregistration.new(credential))]
    }

    return [] // no need to undelegate if no staking key registered
  }

  const result: Array<Certificate> = []

  if (!isRegistered) {
    // if unregistered, need to register first
    result.push(await Certificate.new_stake_registration(await StakeRegistration.new(credential)))
  }

  result.push(
    await Certificate.new_stake_delegation(
      await StakeDelegation.new(credential, await Ed25519KeyHash.from_bytes(Buffer.from(poolRequest, 'hex'))),
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

  const accountKeyString = Buffer.from(await targetAccountKey.to_bytes()).toString('hex')
  const asBase = await BaseAddress.from_address(wasmAddr)

  if (asBase != null) {
    if (Buffer.from(await (await asBase.stake_cred()).to_bytes()).toString('hex') === accountKeyString) {
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
  utxos: ReadonlyArray<AddressedUtxo>,
  acceptTypeMismatch: boolean,
) => {
  const result: AddressedUtxo = []

  for (const utxo of utxos) {
    if (await addrContainsAccountKey(utxo.receiver, stakingKey, acceptTypeMismatch)) {
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
  const stakeCredential = await StakeCredential.from_keyhash(await stakingKey.hash())
  let sumInForKey = new BigNumber(0)
  {
    // note senderUtxos.length is approximately 1
    // since it's just to cover transaction fees
    // so this for loop is faster than building a map
    for (const senderUtxo of utxoResponse.senderUtxos) {
      const match = allUtxos.find(
        (utxo) => utxo.tx_hash === senderUtxo.tx_hash && utxo.tx_index === senderUtxo.tx_index,
      )

      if (match == null) {
        throw new Error('getDifferenceAfterTx: utxo not found. Should not happen')
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
      const address = Buffer.from(await (await output.address()).to_bytes()).toString('hex')

      if (await addrContainsAccountKey(address, stakeCredential, true)) {
        const value = new BigNumber(await (await (await output.amount()).coin()).to_str())
        sumOutForKey = sumOutForKey.plus(value)
      }
    }
  }
  return sumOutForKey.minus(sumInForKey)
}

export const unwrapStakingKey = async (stakingAddress: string): Promise<StakeCredential> => {
  const accountAddress = await RewardAddress.from_address(await Address.from_bytes(Buffer.from(stakingAddress, 'hex')))

  if (accountAddress == null) {
    throw new Error('unwrapStakingKe: staking key invalid')
  }

  const stakingKey = await accountAddress.payment_cred()
  return stakingKey
}
export const getUtxoDelegatedBalance = async (
  allUtxo: ReadonlyArray<AddressedUtxo>,
  stakingAddress: string,
): Promise<BigNumber> => {
  // TODO: need to also deal with pointer address summing
  // can get most recent pointer from getCurrentDelegation result
  const stakingKey = await unwrapStakingKey(stakingAddress)
  const allUtxosForKey = await filterAddressesByStakingKey(stakingKey, allUtxo, false)
  const utxoSum = allUtxosForKey.reduce((sum, utxo) => sum.plus(new BigNumber(utxo.amount)), new BigNumber(0))
  return utxoSum
}

export const getDelegationStatus = (
  rewardAddress: string,
  txCertificatesForKey: Record<string, TimestampedCertMeta>, // key is txId
): StakingStatus => {
  // start with older certificate
  const sortedCerts = sortBy(txCertificatesForKey, (txCerts) => txCerts.submittedAt)
  Logger.debug('txCertificatesForKey', sortedCerts)
  let status: StakingStatus = {isRegistered: false}

  for (const certData of ObjectValues(sortedCerts)) {
    const certificates = certData.certificates

    for (const cert of certificates) {
      if (cert.rewardAddress !== rewardAddress) continue

      if (cert.kind === 'StakeDelegation') {
        assert.assert(cert.poolKeyHash != null, 'getDelegationStatus:: StakeDelegation certificate without poolKeyHash')
        status = {
          poolKeyHash: cert.poolKeyHash,
          isRegistered: true,
        }
      } else if (cert.kind === 'StakeRegistration' || cert.kind === 'MoveInstantaneousRewardsCert') {
        status = {isRegistered: true}
      } else if (cert.kind === 'StakeDeregistration') {
        status = {isRegistered: false}
      }
    }
  }

  return status
}
export type CreateDelegationTxRequest = {
  absSlotNumber: BigNumber
  registrationStatus: boolean
  poolRequest: void | string
  valueInAccount: BigNumber
  addressedUtxos: Array<AddressedUtxo>
  stakingKey: PublicKey
  changeAddr: Addressing & {
    address: string
  }
  defaultAsset: DefaultAsset
  networkConfig: CardanoHaskellShelleyNetwork
}
export type CreateDelegationTxResponse = {
  signRequest: HaskellShelleyTxSignRequest
  totalAmountToDelegate: MultiToken
}
export const createDelegationTx = async (request: CreateDelegationTxRequest): Promise<CreateDelegationTxResponse> => {
  Logger.debug('delegationUtils::createDelegationTx called', request)
  const {
    changeAddr,
    registrationStatus,
    addressedUtxos,
    absSlotNumber,
    stakingKey,
    poolRequest,
    valueInAccount,
    defaultAsset,
    networkConfig,
  } = request

  try {
    const protocolParams = {
      keyDeposit: await BigNum.from_str(networkConfig.KEY_DEPOSIT),
      linearFee: await LinearFee.new(
        await BigNum.from_str(networkConfig.LINEAR_FEE.COEFFICIENT),
        await BigNum.from_str(networkConfig.LINEAR_FEE.CONSTANT),
      ),
      minimumUtxoVal: await BigNum.from_str(networkConfig.MINIMUM_UTXO_VAL),
      poolDeposit: await BigNum.from_str(networkConfig.POOL_DEPOSIT),
      networkId: networkConfig.NETWORK_ID,
    }
    const stakeDelegationCert = await createCertificate(stakingKey, registrationStatus, poolRequest)
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
      false, // no auxiliaryData
    )
    const allUtxosForKey = await filterAddressesByStakingKey(
      await StakeCredential.from_keyhash(await stakingKey.hash()),
      addressedUtxos,
      false,
    )
    const utxoSum = allUtxosForKey.reduce((sum, utxo) => sum.plus(new BigNumber(utxo.amount)), new BigNumber(0))
    const differenceAfterTx = await getDifferenceAfterTx(unsignedTx, addressedUtxos, stakingKey)
    const totalAmountToDelegateBigNum = utxoSum
      .plus(differenceAfterTx) // subtract any part of the fee that comes from UTXO
      .plus(valueInAccount)
    // recall: rewards are compounding
    const totalAmountToDelegate = new MultiToken(
      [
        {
          identifier: defaultAsset.identifier,
          networkId: defaultAsset.networkId,
          amount: totalAmountToDelegateBigNum,
        },
      ],
      {
        defaultNetworkId: defaultAsset.networkId,
        defaultIdentifier: defaultAsset.identifier,
      },
    )
    const signRequest = new HaskellShelleyTxSignRequest({
      senderUtxos: unsignedTx.senderUtxos,
      unsignedTx: unsignedTx.txBuilder,
      changeAddr: unsignedTx.changeAddr,
      auxiliaryData: undefined,
      networkSettingSnapshot: {
        NetworkId: networkConfig.NETWORK_ID,
        ChainNetworkId: Number.parseInt(networkConfig.CHAIN_NETWORK_ID, 10),
        KeyDeposit: new BigNumber(networkConfig.KEY_DEPOSIT),
        PoolDeposit: new BigNumber(networkConfig.POOL_DEPOSIT),
      },
      neededStakingKeyHashes: {
        neededHashes: new Set([
          Buffer.from(await (await StakeCredential.from_keyhash(await stakingKey.hash())).to_bytes()).toString('hex'),
        ]),
        wits: new Set(),
      },
    })
    return {
      signRequest,
      totalAmountToDelegate,
    }
  } catch (e) {
    if (e instanceof LocalizableError || e instanceof ExtendableError) throw e
    Logger.error(`shelley::createDelegationTx:: ${(e as Error).message}`, e)
    throw new CardanoError((e as Error).message)
  }
}
export type CreateWithdrawalTxRequest = {
  absSlotNumber: BigNumber
  getAccountState: (arg0: AccountStateRequest, arg1: BackendConfig) => Promise<AccountStateResponse>
  addressedUtxos: Array<AddressedUtxo>
  withdrawals: Array<
    (
      | {
          privateKey: PrivateKey
        }
      | Addressing
    ) & {
      rewardAddress: string
      // address you're withdrawing from (hex)

      /**
       * you need to withdraw all ADA before deregistering
       * but you don't need to deregister in order to withdraw
       * deregistering gives you back the key deposit
       * so it makes sense if you don't intend to stake on the wallet anymore
       */
      shouldDeregister: boolean
    }
  >
  changeAddr: Addressing & {
    address: string
  }
  networkConfig: CardanoHaskellShelleyNetwork
}
export type CreateWithdrawalTxResponse = HaskellShelleyTxSignRequest
export const createWithdrawalTx = async (request: CreateWithdrawalTxRequest): Promise<CreateWithdrawalTxResponse> => {
  Logger.debug('delegationUtils::createWithdrawalTx called', request)
  const {changeAddr, addressedUtxos, networkConfig} = request

  try {
    const protocolParams = {
      keyDeposit: await BigNum.from_str(networkConfig.KEY_DEPOSIT),
      linearFee: await LinearFee.new(
        await BigNum.from_str(networkConfig.LINEAR_FEE.COEFFICIENT),
        await BigNum.from_str(networkConfig.LINEAR_FEE.CONSTANT),
      ),
      minimumUtxoVal: await BigNum.from_str(networkConfig.MINIMUM_UTXO_VAL),
      poolDeposit: await BigNum.from_str(networkConfig.POOL_DEPOSIT),
      networkId: networkConfig.NETWORK_ID,
    }
    const certificates: Array<Certificate> = []
    const neededKeys = {
      neededHashes: new Set<string>(),
      wits: new Set<string>(),
    }
    const requiredWits: Array<Ed25519KeyHash> = []

    for (const withdrawal of request.withdrawals) {
      const wasmAddr = await RewardAddress.from_address(
        await Address.from_bytes(Buffer.from(withdrawal.rewardAddress, 'hex')),
      )

      if (wasmAddr == null) {
        throw new Error('delegationUtils::createWithdrawalTx withdrawal not a reward address')
      }

      const paymentCred = await wasmAddr.payment_cred()
      const keyHash = await paymentCred.to_keyhash()

      if (keyHash == null) {
        throw new Error('Unexpected: withdrawal from a script hash')
      }

      requiredWits.push(keyHash)

      if (withdrawal.shouldDeregister) {
        certificates.push(await Certificate.new_stake_deregistration(await StakeDeregistration.new(paymentCred)))
        neededKeys.neededHashes.add(Buffer.from(await paymentCred.to_bytes()).toString('hex'))
      }
    }

    const accountStates = await request.getAccountState(
      {
        addresses: request.withdrawals.map((withdrawal) => withdrawal.rewardAddress),
      },
      networkConfig.BACKEND,
    )
    const finalWithdrawals: Array<{
      address: RewardAddress
      amount: BigNum
    }> = []

    for (const address of Object.keys(accountStates)) {
      const rewardForAddress = accountStates[address]

      // if key is not registered, we just skip this withdrawal
      if (rewardForAddress == null) {
        continue
      }

      const rewardBalance = new BigNumber(rewardForAddress.remainingAmount)

      // if the reward address is empty, we filter it out of the withdrawal list
      // although the protocol allows withdrawals of 0 ADA, it's pointless to do
      // recall: you may want to undelegate the ADA even if there is 0 ADA in the reward address
      // since you may want to get back your deposit
      if (rewardBalance.eq(0)) {
        continue
      }

      const rewardAddress = await RewardAddress.from_address(await Address.from_bytes(Buffer.from(address, 'hex')))

      if (rewardAddress == null) {
        throw new Error('withdrawal not a reward address')
      }

      {
        const stakeCredential = await rewardAddress.payment_cred()
        neededKeys.neededHashes.add(Buffer.from(await stakeCredential.to_bytes()).toString('hex'))
      }
      finalWithdrawals.push({
        address: rewardAddress,
        amount: await BigNum.from_str(rewardForAddress.remainingAmount),
      })
    }

    // if the end result is no withdrawals and no deregistrations, throw an error
    if (finalWithdrawals.length === 0 && certificates.length === 0) {
      throw new RewardAddressEmptyError()
    }

    const unsignedTxResponse = await newAdaUnsignedTx(
      [],
      {
        address: changeAddr.address,
        addressing: changeAddr.addressing,
      },
      addressedUtxos,
      request.absSlotNumber,
      protocolParams,
      certificates,
      finalWithdrawals,
      false,
    )

    // there wasn't enough in the withdrawal to send anything to us
    if (unsignedTxResponse.changeAddr.length === 0) {
      throw new InsufficientFunds()
    }

    Logger.debug('delegationUtils::createWithdrawalTx success', JSON.stringify(unsignedTxResponse))
    {
      const body = await unsignedTxResponse.txBuilder.build()

      for (const withdrawal of request.withdrawals) {
        if (withdrawal.privateKey != null) {
          const {privateKey} = withdrawal
          neededKeys.wits.add(
            Buffer.from(await (await make_vkey_witness(await hash_transaction(body), privateKey)).to_bytes()).toString(
              'hex',
            ),
          )
        }
      }
    }
    return new HaskellShelleyTxSignRequest({
      senderUtxos: unsignedTxResponse.senderUtxos,
      unsignedTx: unsignedTxResponse.txBuilder,
      changeAddr: unsignedTxResponse.changeAddr,
      auxiliaryData: undefined,
      networkSettingSnapshot: {
        NetworkId: networkConfig.NETWORK_ID,
        ChainNetworkId: Number.parseInt(networkConfig.CHAIN_NETWORK_ID, 10),
        KeyDeposit: new BigNumber(networkConfig.KEY_DEPOSIT),
        PoolDeposit: new BigNumber(networkConfig.POOL_DEPOSIT),
      },
      neededStakingKeyHashes: neededKeys,
    })
  } catch (e) {
    if (e instanceof LocalizableError || e instanceof ExtendableError) throw e
    Logger.error('delegationUtils::createWithdrawalTx error:', JSON.stringify(e))
    throw e
  }
}
