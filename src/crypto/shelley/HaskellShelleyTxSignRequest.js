// @flow

import {BigNumber} from 'bignumber.js'
import {ISignRequest} from '../ISignRequest'
/* eslint-disable camelcase */
import {
  RewardAddress,
  TransactionBuilder,
  AuxiliaryData, // TODO: rust bindings not yet available
  hash_transaction,
} from '@emurgo/react-native-haskell-shelley'

import {CONFIG} from '../../config/config'
import {multiTokenFromCardanoValue, toHexOrBase58} from './utils'
import {MultiToken} from '../MultiToken'

import type {Address, AddressedUtxo, Addressing, Value} from '../types'

const PRIMARY_ASSET_CONSTANTS = CONFIG.PRIMARY_ASSET_CONSTANTS

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
  +NetworkId: number,
  +ChainNetworkId: number,
  +PoolDeposit: BigNumber,
  +KeyDeposit: BigNumber,
|}

type LedgerNanoCatalystRegistrationTxSignData = {|
  votingPublicKey: string,
  stakingKeyPath: Array<number>,
  stakingKey: string,
  rewardAddress: string,
  nonce: number,
|}

// prettier-ignore
export class HaskellShelleyTxSignRequest
implements ISignRequest<TransactionBuilder> {
  senderUtxos: Array<AddressedUtxo>
  unsignedTx: TransactionBuilder
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>
  auxiliaryData: void | AuxiliaryData
  networkSettingSnapshot: NetworkSettingSnapshot
  // TODO: this should be provided by WASM in some SignedTxBuilder interface of some kind
  neededStakingKeyHashes: {|
    neededHashes: Set<string>, // StakeCredential
    wits: Set<string>, // Vkeywitness
  |}

  ledgerNanoCatalystRegistrationTxSignData: void | LedgerNanoCatalystRegistrationTxSignData;

  constructor(data: {
      senderUtxos: Array<AddressedUtxo>,
      unsignedTx: TransactionBuilder,
      changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
      auxiliaryData: void | AuxiliaryData,
      networkSettingSnapshot: NetworkSettingSnapshot,
      neededStakingKeyHashes: {|
        neededHashes: Set<string>, // StakeCredential
        wits: Set<string>, // Vkeywitness
      |},
      ledgerNanoCatalystRegistrationTxSignData?:
        void | LedgerNanoCatalystRegistrationTxSignData,
      }
  ) {
    this.senderUtxos = data.senderUtxos
    this.unsignedTx = data.unsignedTx
    this.changeAddr = data.changeAddr
    this.auxiliaryData = data.auxiliaryData
    this.networkSettingSnapshot = data.networkSettingSnapshot
    this.neededStakingKeyHashes = data.neededStakingKeyHashes
    this.ledgerNanoCatalystRegistrationTxSignData = data.ledgerNanoCatalystRegistrationTxSignData
  }

  async txId(): Promise<string> {
    return Buffer.from(
      await (await hash_transaction(
        await this.unsignedTx.build(),
      )).to_bytes(),
    ).toString('hex')
  }

  auxiliary(): void | AuxiliaryData {
    return this.auxiliaryData
  }

  async totalInput(): Promise<MultiToken> {
    const values = await multiTokenFromCardanoValue(
      await (await this.unsignedTx.get_implicit_input()).checked_add(
        await this.unsignedTx.get_explicit_input()
      ),
      {
        defaultIdentifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
        defaultNetworkId: this.networkSettingSnapshot.NetworkId,
      },
    )
    this.changeAddr.forEach((change) => values.joinSubtractMutable(change.values))

    return values
  }

  async totalOutput(): Promise<MultiToken> {
    return multiTokenFromCardanoValue(
      await this.unsignedTx.get_explicit_output(),
      {
        defaultIdentifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
        defaultNetworkId: this.networkSettingSnapshot.NetworkId,
      },
    )
  }

  async fee(): Promise<MultiToken> {
    const values = new MultiToken(
      [],
      {
        defaultNetworkId: this.networkSettingSnapshot.NetworkId,
        defaultIdentifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
      }
    )
    const _fee = await this.unsignedTx.get_fee_if_set()
    const fee = new BigNumber(
      _fee != null ? await _fee.to_str() : '0',
    ).plus(await (await this.unsignedTx.get_deposit()).to_str())

    values.add({
      identifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
      amount: fee,
      networkId: this.networkSettingSnapshot.NetworkId,
    })
    return values
  }

  async withdrawals(): Promise<Array<{|address: string, amount: MultiToken|}>> {
    // prettier-ignore
    const withdrawals = await (await this.unsignedTx
      .build())
      .withdrawals()
    if (withdrawals == null) return []

    const withdrawalKeys = await withdrawals.keys()
    const result = []
    for (let i = 0; i < (await withdrawalKeys.len()); i++) {
      const rewardAddress = await withdrawalKeys.get(i)
      const withdrawalAmountPtr = await withdrawals.get(rewardAddress)
      if (withdrawalAmountPtr == null) continue
      const withdrawalAmount = await withdrawalAmountPtr.to_str()

      const amount = new MultiToken(
        [{
          identifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
          amount: new BigNumber(withdrawalAmount),
          networkId: this.networkSettingSnapshot.NetworkId,
        }],
        {
          defaultNetworkId: this.networkSettingSnapshot.NetworkId,
          defaultIdentifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
        }
      )
      result.push({
        address: Buffer.from(
          await (await rewardAddress.to_address()).to_bytes(),
        ).toString('hex'),
        amount,
      })
    }
    return result
  }

  async keyDeregistrations(): Promise<
    Array<{|
      rewardAddress: string,
      refund: MultiToken,
    |}>> {
    const certs = await (await this.unsignedTx.build()).certs()
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
        refund: new MultiToken(
          [{
            identifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
            amount: this.networkSettingSnapshot.KeyDeposit,
            networkId: this.networkSettingSnapshot.NetworkId,
          }],
          {
            defaultNetworkId: this.networkSettingSnapshot.NetworkId,
            defaultIdentifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
          }
        ),
      })
    }
    return result
  }

  async receivers(includeChange: boolean): Promise<Array<string>> {
    const outputs = await (await this.unsignedTx.build()).outputs()

    const outputStrings = []
    for (let i = 0; i < (await outputs.len()); i++) {
      outputStrings.push(
        await toHexOrBase58(await (await outputs.get(i)).address()),
      )
    }

    if (!includeChange) {
      const changeAddrs = this.changeAddr.map(
        (change) => change.address,
      )
      return outputStrings.filter((addr) => !changeAddrs.includes(addr))
    }
    return outputStrings
  }

  uniqueSenderAddresses(): Array<string> {
    return Array.from(
      new Set(this.senderUtxos.map((utxo) => utxo.receiver)),
    )
  }

  async isEqual(tx: ?(mixed | TransactionBuilder)): Promise<boolean> {
    if (tx == null) return false
    if (!(tx instanceof TransactionBuilder)) {
      return false
    }
    return await shelleyTxEqual(this.unsignedTx, tx)
  }

  self(): TransactionBuilder {
    return this.unsignedTx
  }
}
