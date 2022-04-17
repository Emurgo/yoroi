import {BigNumber} from 'bignumber.js'

import {CONFIG} from '../../legacy/config'
import {ISignRequest} from '../../legacy/ISignRequest'
import type {CardanoHaskellShelleyNetwork} from '../../legacy/networks'
import type {Address, Value} from '../../legacy/types'
import {multiTokenFromCardanoValue, toHexOrBase58} from '../../legacy/utils'
import {AddressedUtxo, Addressing, SendTokenList} from '../../types'
import {CardanoTypes, hashTransaction, RewardAddress} from '../index'
import type {DefaultTokenEntry} from './MultiToken'
import {MultiToken} from './MultiToken'

const PRIMARY_ASSET_CONSTANTS = CONFIG.PRIMARY_ASSET_CONSTANTS
export const shelleyTxEqual = async (
  req1: CardanoTypes.TransactionBuilder,
  req2: CardanoTypes.TransactionBuilder,
): Promise<boolean> => {
  const tx1Hex = Buffer.from(await (await req1.build()).toBytes()).toString('hex')
  const tx2Hex = Buffer.from(await (await req2.build()).toBytes()).toString('hex')
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
type NetworkSettingSnapshot = {
  // there is no way given just a transaction body to 100% know which network it belongs to
  readonly NetworkId: number
  readonly ChainNetworkId: number
  readonly PoolDeposit: BigNumber
  readonly KeyDeposit: BigNumber
}
type LedgerNanoCatalystRegistrationTxSignData = {
  votingPublicKey: string
  stakingKeyPath: Array<number>
  stakingKey: string
  rewardAddress: string
  nonce: number
}
export type CreateUnsignedTxRequest = {
  changeAddr: Addressing & {
    address: string
  }
  absSlotNumber: BigNumber
  receiver: string
  addressedUtxos: Array<AddressedUtxo>
  defaultToken: DefaultTokenEntry
  tokens: SendTokenList
  auxiliaryData?: CardanoTypes.AuxiliaryData
  networkConfig: CardanoHaskellShelleyNetwork
}
export class HaskellShelleyTxSignRequest implements ISignRequest<CardanoTypes.TransactionBuilder> {
  senderUtxos: Array<AddressedUtxo>
  unsignedTx: CardanoTypes.TransactionBuilder
  changeAddr: Array<Address & Value & Addressing>
  auxiliaryData: undefined | CardanoTypes.AuxiliaryData
  networkSettingSnapshot: NetworkSettingSnapshot
  // TODO: this should be provided by WASM in some SignedTxBuilder interface of some kind
  neededStakingKeyHashes: {
    neededHashes: Set<string>
    // StakeCredential
    wits: Set<string> // Vkeywitness
  }

  ledgerNanoCatalystRegistrationTxSignData: void | LedgerNanoCatalystRegistrationTxSignData

  constructor(data: {
    senderUtxos: Array<AddressedUtxo>
    unsignedTx: CardanoTypes.TransactionBuilder
    changeAddr: Array<Address & Value & Addressing>
    auxiliaryData: undefined | CardanoTypes.AuxiliaryData
    networkSettingSnapshot: NetworkSettingSnapshot
    neededStakingKeyHashes: {
      neededHashes: Set<string>
      // StakeCredential
      wits: Set<string> // Vkeywitness
    }
    ledgerNanoCatalystRegistrationTxSignData?: void | LedgerNanoCatalystRegistrationTxSignData
  }) {
    this.senderUtxos = data.senderUtxos
    this.unsignedTx = data.unsignedTx
    this.changeAddr = data.changeAddr
    this.auxiliaryData = data.auxiliaryData
    this.networkSettingSnapshot = data.networkSettingSnapshot
    this.neededStakingKeyHashes = data.neededStakingKeyHashes
    this.ledgerNanoCatalystRegistrationTxSignData = data.ledgerNanoCatalystRegistrationTxSignData
  }

  async txId() {
    return Buffer.from(await (await hashTransaction(await this.unsignedTx.build())).toBytes()).toString('hex')
  }

  auxiliary() {
    return this.auxiliaryData
  }

  async totalInput() {
    const values = await multiTokenFromCardanoValue(
      await (await this.unsignedTx.getImplicitInput()).checkedAdd(await this.unsignedTx.getExplicitInput()),
      {
        defaultIdentifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
        defaultNetworkId: this.networkSettingSnapshot.NetworkId,
      },
    )
    this.changeAddr.forEach((change) => values.joinSubtractMutable(change.values))
    return values
  }

  async totalOutput() {
    return multiTokenFromCardanoValue(await this.unsignedTx.getExplicitOutput(), {
      defaultIdentifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
      defaultNetworkId: this.networkSettingSnapshot.NetworkId,
    })
  }

  async fee() {
    const values = new MultiToken([], {
      defaultNetworkId: this.networkSettingSnapshot.NetworkId,
      defaultIdentifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
    })

    const _fee = await this.unsignedTx.getFeeIfSet()

    const fee = new BigNumber(_fee != null ? await _fee.toStr() : '0').plus(
      await (await this.unsignedTx.getDeposit()).toStr(),
    )
    values.add({
      identifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
      amount: fee,
      networkId: this.networkSettingSnapshot.NetworkId,
    })
    return values
  }

  async withdrawals() {
    const withdrawals = await (await this.unsignedTx.build()).withdrawals()
    if (withdrawals == null) return []
    const withdrawalKeys = await withdrawals.keys()
    const result: Array<TxWithdrawal> = []

    for (let i = 0; i < (await withdrawalKeys.len()); i++) {
      const rewardAddress = await withdrawalKeys.get(i)
      const withdrawalAmountPtr = await withdrawals.get(rewardAddress)
      if (withdrawalAmountPtr == null) continue
      const withdrawalAmount = await withdrawalAmountPtr.toStr()
      const amount = new MultiToken(
        [
          {
            identifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
            amount: new BigNumber(withdrawalAmount),
            networkId: this.networkSettingSnapshot.NetworkId,
          },
        ],
        {
          defaultNetworkId: this.networkSettingSnapshot.NetworkId,
          defaultIdentifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
        },
      )
      result.push({
        address: Buffer.from(await (await rewardAddress.toAddress()).toBytes()).toString('hex'),
        amount,
      })
    }

    return result
  }

  async keyDeregistrations() {
    const certs = await (await this.unsignedTx.build()).certs()
    if (certs == null) return []
    const result: Array<TxDeregistration> = []

    for (let i = 0; i < (await certs.len()); i++) {
      const cert = await (await certs.get(i)).asStakeDeregistration()
      if (cert == null) continue
      const address = await RewardAddress.new(this.networkSettingSnapshot.ChainNetworkId, await cert.stakeCredential())
      result.push({
        rewardAddress: Buffer.from(await (await address.toAddress()).toBytes()).toString('hex'),
        // recall: for now you get the full deposit back. May change in the future
        refund: new MultiToken(
          [
            {
              identifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
              amount: this.networkSettingSnapshot.KeyDeposit,
              networkId: this.networkSettingSnapshot.NetworkId,
            },
          ],
          {
            defaultNetworkId: this.networkSettingSnapshot.NetworkId,
            defaultIdentifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
          },
        ),
      })
    }

    return result
  }

  async receivers(includeChange: boolean) {
    const outputs = await (await this.unsignedTx.build()).outputs()
    const outputStrings: Array<string> = []

    for (let i = 0; i < (await outputs.len()); i++) {
      outputStrings.push(await toHexOrBase58(await (await outputs.get(i)).address()))
    }

    if (!includeChange) {
      const changeAddrs = this.changeAddr.map((change) => change.address)
      return outputStrings.filter((addr) => !changeAddrs.includes(addr))
    }

    return outputStrings
  }

  uniqueSenderAddresses() {
    return Array.from(new Set(this.senderUtxos.map((utxo) => utxo.receiver)))
  }

  async isEqual(tx: (unknown | CardanoTypes.TransactionBuilder) | null | undefined) {
    if (tx == null) return false

    if (!(tx instanceof CardanoTypes.TransactionBuilder)) {
      return false
    }

    return await shelleyTxEqual(this.unsignedTx, tx)
  }

  self() {
    return this.unsignedTx
  }
}

export type TxWithdrawal = {
  address: string
  amount: MultiToken
}
export type TxDeregistration = {
  rewardAddress: string
  refund: MultiToken
}
