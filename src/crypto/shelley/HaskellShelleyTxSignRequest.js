// @flow

// TODO(v-almonacid): we cannot yet implement HaskellShelleyTxSignRequest
// because there are still some bindings missing

import {BigNumber} from 'bignumber.js'
import {ISignRequest} from '../ISignRequest'
/* eslint-disable camelcase */
import {
  RewardAddress, // TODO
  TransactionBuilder,
  TransactionMetadata, // TODO
  hash_transaction,
} from 'react-native-haskell-shelley'

import {CONFIG} from '../../config/config'
import {toHexOrBase58} from './utils'

import type {BaseSignRequest} from '../types'

const NUMBERS = CONFIG.NUMBERS

export const shelleyTxEqual = async (
  req1: TransactionBuilder,
  req2: TransactionBuilder,
): Promise<boolean> => {
  const tx1Hex = Buffer.from(await (await req1.build()).to_bytes()).toString(
    'hex',
  )
  const tx2Hex = Buffer.from(await (await req2.build()).to_bytes()).toString(
    'hex',
  )
  return tx1Hex === tx2Hex
}

/**
 * We take a copy of these parameters instead of re-evaluating them from the network
 * There are two reasons for this
 * 1) In Cardano, the protocol parameters used for transaction validation
 *    are the ones active the slot the transaction gets inserted it, and not the TTL slot
 *    Since a sign request isn't a slot yet, we need to keep track of which parameters we used
 * 2) Attempting to calculate the value of the network parameter at the time a transaction happens
 *    may require a database access
 *    and it doesn't make sense that this class be aware of the database or take any locks
 */
type NetworkSettingSnapshot = {|
  // there is no way given just a transaction body to 100% know which network it belongs to
  +ChainNetworkId: number,
  +PoolDeposit: BigNumber,
  +KeyDeposit: BigNumber,
|}
// prettier-ignore
export class HaskellShelleyTxSignRequest
implements ISignRequest<TransactionBuilder> {
  signRequest: BaseSignRequest<TransactionBuilder>
  metadata: void | TransactionMetadata // TODO: shouldn't need this
  networkSettingSnapshot: NetworkSettingSnapshot
  // TODO: this should be provided by WASM in some SignedTxBuilder interface of some kind
  neededStakingKeyHashes: {|
    neededHashes: Set<string>, // StakeCredential
    wits: Set<string>, // Vkeywitness
  |}

  constructor(
    signRequest: BaseSignRequest<TransactionBuilder>,
    metadata: void | TransactionMetadata,
    networkSettingSnapshot: NetworkSettingSnapshot,
    neededStakingKeyHashes: {|
      neededHashes: Set<string>, // StakeCredential
      wits: Set<string>, // Vkeywitness
    |},
  ) {
    this.signRequest = signRequest
    this.metadata = metadata
    this.networkSettingSnapshot = networkSettingSnapshot
    this.neededStakingKeyHashes = neededStakingKeyHashes
  }

  async txId(): Promise<string> {
    return Buffer.from(
      await (await hash_transaction(
        await this.signRequest.unsignedTx.build(),
      )).to_bytes(),
    ).toString('hex')
  }

  txMetadata(): void | TransactionMetadata {
    return this.metadata
  }

  async totalInput(shift: boolean): Promise<BigNumber> {
    const inputTotal = await (
      await this.signRequest.unsignedTx.get_implicit_input()
    ).checked_add(
      await this.signRequest.unsignedTx.get_explicit_input(),
    )

    const change = this.signRequest.changeAddr
      .map((val) => new BigNumber(val.value || new BigNumber(0)))
      .reduce((sum, val) => sum.plus(val), new BigNumber(0))
    const result = new BigNumber(await inputTotal.to_str()).minus(change)
    if (shift) {
      return result.shiftedBy(-NUMBERS.DECIMAL_PLACES_IN_ADA)
    }
    return result
  }

  async totalOutput(shift: boolean): Promise<BigNumber> {
    const totalOutput = await this.signRequest.unsignedTx.get_explicit_output()

    const result = new BigNumber(await totalOutput.to_str())
    if (shift) {
      return result.shiftedBy(-NUMBERS.DECIMAL_PLACES_IN_ADA)
    }
    return result
  }

  async fee(shift: boolean): Promise<BigNumber> {
    const _fee = await this.signRequest.unsignedTx.get_fee_if_set()
    const fee = new BigNumber(
      _fee != null ? _fee.to_str() : '0',
    ).plus(await (await this.signRequest.unsignedTx.get_deposit()).to_str())

    if (shift) {
      return fee.shiftedBy(-NUMBERS.DECIMAL_PLACES_IN_ADA)
    }
    return fee
  }

  async withdrawals(
    shift: boolean,
  ): Promise<
    Array<{|
      address: string,
      amount: BigNumber,
    |}>,
  > {
    const withdrawals = await await this.signRequest.unsignedTx
      .build()
      .withdrawals()
    if (withdrawals == null) return []

    const withdrawalKeys = await withdrawals.keys()
    const result = []
    for (let i = 0; i < (await withdrawalKeys.len()); i++) {
      const rewardAddress = await withdrawalKeys.get(i)
      const withdrawalAmountPtr = await withdrawals.get(rewardAddress)
      if (withdrawalAmountPtr == null) continue
      const withdrawalAmount = await withdrawalAmountPtr.to_str()

      const amount = shift
        ? new BigNumber(withdrawalAmount).shiftedBy(
          -NUMBERS.DECIMAL_PLACES_IN_ADA,
        )
        : new BigNumber(withdrawalAmount)
      result.push({
        address: Buffer.from(
          await (await rewardAddress.to_address()).to_bytes(),
        ).toString('hex'),
        amount,
      })
    }
    return result
  }

  async keyDeregistrations(
    shift: boolean,
  ): Promise<
    Array<{|
      rewardAddress: string,
      refund: BigNumber,
    |}>,
  > {
    const certs = await (await this.signRequest.unsignedTx.build()).certs()
    if (certs == null) return []

    const result = []
    for (let i = 0; i < (await certs.len()); i++) {
      const cert = await (await certs.get(i)).as_stake_deregistration()
      if (cert == null) continue

      const address = await RewardAddress.new(
        this.networkSettingSnapshot.ChainNetworkId,
        await cert.stake_credential(),
      )
      result.push({
        rewardAddress: Buffer.from(
          await (await address.to_address()).to_bytes(),
        ).toString('hex'),
        // recall: for now you get the full deposit back. May change in the future
        refund: shift
          ? this.networkSettingSnapshot.KeyDeposit.shiftedBy(
            -NUMBERS.DECIMAL_PLACES_IN_ADA,
          )
          : this.networkSettingSnapshot.KeyDeposit,
      })
    }
    return result
  }

  async receivers(includeChange: boolean): Promise<Array<string>> {
    const outputs = await (await this.signRequest.unsignedTx.build()).outputs()

    const outputStrings = []
    for (let i = 0; i < (await outputs.len()); i++) {
      outputStrings.push(
        await toHexOrBase58(await (await outputs.get(i)).address()),
      )
    }

    if (!includeChange) {
      const changeAddrs = this.signRequest.changeAddr.map(
        (change) => change.address,
      )
      return outputStrings.filter((addr) => !changeAddrs.includes(addr))
    }
    return outputStrings
  }

  uniqueSenderAddresses(): Array<string> {
    return Array.from(
      new Set(this.signRequest.senderUtxos.map((utxo) => utxo.receiver)),
    )
  }

  async isEqual(tx: ?(mixed | TransactionBuilder)): Promise<boolean> {
    if (tx == null) return false
    if (!(tx instanceof TransactionBuilder)) {
      return false
    }
    return await shelleyTxEqual(this.signRequest.unsignedTx, tx)
  }

  self(): BaseSignRequest<TransactionBuilder> {
    return this.signRequest
  }
}
