/* eslint-disable @typescript-eslint/no-explicit-any */
import type {WalletChecksum} from '@emurgo/cip4-js'
import {
  Certificate as V4Certificate,
  TransactionBuilder as V4TransactionBuilder,
} from '@emurgo/react-native-haskell-shelley'
import {LinearFee} from '@emurgo/react-native-haskell-shelley'
import {BigNumber} from 'bignumber.js'

import {TokenInfo} from '../types'
import {MultiToken} from '../yoroi-wallets'
export type Address = {
  readonly address: string
}
export type Value = {
  values: MultiToken
}
// note(v-almonacid): this is the old addressing format used during the Byron
// era and the ITN. It was used, for instance, as the tx input format in the
// rust V1 tx sign function.
export type LegacyAddressing = {
  addressing: {
    account: number
    change: number
    index: number
  }
}
export type LegacyAddressedUtxo = RawUtxo & LegacyAddressing
export type Addressing = {
  readonly addressing: {
    readonly path: Array<number>
    readonly startLevel: number
  }
}
// equivalent to CardanoAddressedUtxo in the Yoroi extension
export type AddressedUtxo = RawUtxo & Addressing
// Byron-era Types
export type TransactionOutput = Address & {
  value: string
}
export type TransactionInput = LegacyAddressing & {
  ptr: {
    id: string
    index: number
  }
  value: Address & {
    value: string
  }
}
export type PreparedTransactionData = {
  changeAddress: string
  fee: BigNumber
  inputs: Array<TransactionInput>
  outputs: Array<TransactionOutput>
}
export type V1SignedTx = {
  cbor_encoded_tx: string
  fee: BigNumber
  changedUsed: boolean
}

/**
 * Jormungandr-era tx types
 */
// similar to yoroi-frontend's V3UnsignedTxUtxoResponse
export type V3UnsignedTxData<T> = {
  senderUtxos: Array<RawUtxo>
  IOs: T
  changeAddr: Array<
    Addressing & {
      address: string
      value: void | BigNumber
    }
  >
}
// similar to yoroi-frontend's V3UnsignedTxAddressedUtxoResponse
export type V3UnsignedTxAddressedUtxoData<T> = {
  senderUtxos: Array<AddressedUtxo>
  IOs: T
  changeAddr: Array<
    Addressing & {
      address: string
      value: void | BigNumber
    }
  >
  certificate: void | any
}

/**
 * Haskell-Shelley-era tx types
 */
export type TxOutput = Address & {
  amount: MultiToken
}
export type V4UnsignedTxUtxoResponse = {
  senderUtxos: Array<RawUtxo>
  txBuilder: V4TransactionBuilder
  changeAddr: Array<Address & Value & Addressing>
}
export type V4UnsignedTxAddressedUtxoResponse = {
  senderUtxos: Array<AddressedUtxo>
  txBuilder: V4TransactionBuilder
  changeAddr: Array<Address & Value & Addressing>
  certificates: ReadonlyArray<V4Certificate>
}

/**
 * wallet types
 */
export type WalletState = {
  lastGeneratedAddressIndex: number
}
export type EncryptionMethod = 'BIOMETRICS' | 'SYSTEM_PIN' | 'MASTER_PASSWORD'
export type PlateResponse = {
  addresses: Array<string>
  accountPlate: WalletChecksum
}
export type ProtocolParameters = {
  readonly linearFee: LinearFee
  readonly minimumUtxoVal: BigNumber
  readonly poolDeposit: BigNumber
  readonly keyDeposit: BigNumber
  readonly networkId: number
  readonly maxValueBytes?: number
  readonly maxTxBytes?: number
}

/**
 * API-related types
 */
import type {TransactionStatus} from './HistoryTransaction'
export type RemoteAsset = {
  readonly amount: string
  readonly assetId: string
  readonly policyId: string
  readonly name: string
}
// this is equivalent to yoroi-frontend's `RemoteUnspentOutput`
export type RawUtxo = {
  readonly amount: string
  readonly receiver: string
  readonly tx_hash: string
  readonly tx_index: number
  readonly utxo_id: string
  readonly assets: ReadonlyArray<RemoteAsset>
}
export const CERTIFICATE_KIND = {
  STAKE_REGISTRATION: 'StakeRegistration',
  STAKE_DEREGISTRATION: 'StakeDeregistration',
  STAKE_DELEGATION: 'StakeDelegation',
  POOL_REGISTRATION: 'PoolRegistration',
  POOL_RETIREMENT: 'PoolRetirement',
  MOVE_INSTANTANEOUS_REWARDS: 'MoveInstantaneousRewardsCert',
}
export type CertificateKind = typeof CERTIFICATE_KIND[keyof typeof CERTIFICATE_KIND]
// getAccountState
export type AccountStateRequest = {
  addresses: Array<string>
}
export type RemoteAccountState = {
  poolOperator: null
  // not implemented yet
  remainingAmount: string
  // current remaining awards
  rewards: string
  // all the rewards every added
  withdrawals: string // all the withdrawals that have ever happened
}
export type AccountStateResponse = Record<string, null | RemoteAccountState>
// getPoolInfo
export type RemoteCertificate = {
  kind: 'PoolRegistration' | 'PoolRetirement'
  certIndex: number
  poolParams: Record<string, any> // don't think this is relevant
}
export type RemotePoolMetaSuccess = {
  info:
    | {
        name?: string
        ticker?: string
        description?: string
        homepage?: string // other stuff from SMASH.
      }
    | null
    | undefined
  history: Array<{
    epoch: number
    slot: number
    tx_ordinal: number
    cert_ordinal: number
    payload: RemoteCertificate
  }>
}
export type RemotePoolMetaFailure = {
  error: Record<string, any>
}
export type PoolInfoRequest = {
  poolIds: Array<string>
}
// getTokenInfo
export type TokenInfoRequest = {
  tokenIds: Array<string>
}

export type TokenInfoResponse = Record<string, TokenInfo | null>
// getTxsBodiesForUTXOs
export type TxBodiesRequest = {
  txsHashes: Array<string>
}
export type TxBodiesResponse = Record<string, string>
// reputation
export type ReputationObject = {
  node_flags?: number // note: could be more metrics that are not handled
}
export type ReputationResponse = Record<string, ReputationObject>
// serverstatus
export type ServerStatusResponse = {
  isServerOk: boolean
  isMaintenance: boolean
  serverTime: number
  // in milliseconds
  isQueueOnline?: boolean
}
// bestblock
export type BestblockResponse = {
  height: number
  epoch: number | null | undefined
  slot: number | null | undefined
  hash: string | null | undefined
}
// tx history
export type TxHistoryRequest = {
  addresses: Array<string>
  untilBlock: string
  after?: {
    block: string
    tx: string
  }
}
export type RemoteTransactionInputBase = {
  readonly address: string
  readonly amount: string
  readonly assets: ReadonlyArray<RemoteAsset>
}
export type RemoteTransactionUtxoInput = {
  readonly id: string
  // concatenation of txHash || index
  readonly index: number
  readonly txHash: string
}
// not considering acount txs for now
export type RemoteTransactionInput = RemoteTransactionInputBase & RemoteTransactionUtxoInput
export type RemoteTransactionOutput = {
  readonly address: string
  readonly amount: string
  readonly assets: ReadonlyArray<RemoteAsset>
}

/**
 * only present if TX is in a block
 */
export type RemoteTxBlockMeta = {
  readonly block_num: number
  readonly block_hash: string
  readonly tx_ordinal: number
  readonly time: string
  // timestamp with timezone
  readonly epoch: number
  readonly slot: number
}
// See complete types in:
// https://github.com/Emurgo/yoroi-graphql-migration-backend#output-6
export type RemoteCertificateMeta =
  | {
      kind: typeof CERTIFICATE_KIND.STAKE_REGISTRATION
      rewardAddress: string // hex
    }
  | {
      kind: typeof CERTIFICATE_KIND.STAKE_DEREGISTRATION
      rewardAddress: string // hex
    }
  | {
      kind: typeof CERTIFICATE_KIND.STAKE_DELEGATION
      rewardAddress: string
      // hex
      poolKeyHash: string // hex
    }
  | {
      kind: typeof CERTIFICATE_KIND.POOL_REGISTRATION
      poolParams: Record<string, any> // we don't care about this for now
    }
  | {
      kind: typeof CERTIFICATE_KIND.POOL_RETIREMENT
      poolKeyHash: string // hex
    }
  | {
      kind: typeof CERTIFICATE_KIND.MOVE_INSTANTANEOUS_REWARDS
      rewards: Record<string, string>
      pot: 0 | 1
    }
export type RemoteTxInfo = {
  readonly type: 'byron' | 'shelley'
  readonly fee?: string
  // only in shelley txs
  readonly hash: string
  readonly last_update: string
  // timestamp with timezone
  readonly tx_state: TransactionStatus
  readonly inputs: Array<RemoteTransactionInput>
  readonly outputs: Array<RemoteTransactionOutput>
  readonly withdrawals: Array<{
    address: string
    // hex
    amount: string
  }>
  readonly certificates: Array<RemoteCertificateMeta>
  readonly valid_contract?: boolean
  readonly script_size?: number
  readonly collateral_inputs?: Array<RemoteTransactionInput>
}
export type RawTransaction = Partial<RemoteTxBlockMeta> & RemoteTxInfo
// Catalyst
type FundInfo = {
  readonly id: number
  readonly registrationStart: string
  readonly registrationEnd: string
  readonly votingStart?: string
  readonly votingEnd?: string
  readonly votingPowerThreshold: string // in ada
}
export type FundInfoResponse = {
  readonly currentFund: FundInfo | null | undefined
  readonly nextFund: FundInfo | null | undefined
}
export type TxSubmissionStatus = {
  readonly submissionStatus: 'WAITING' | 'FAILED' | 'MAX_RETRY_REACHED' | 'SUCCESS'
  readonly reason?: string
}
export type TxStatusRequest = {
  txHashes: Array<string>
}
export type TxStatusResponse = {
  readonly depth?: Record<string, number>
  readonly submissionStatus?: Record<string, TxSubmissionStatus>
}
