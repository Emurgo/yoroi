// @flow

/**
 * API-related types
 */
import type {TransactionStatus} from '../types/HistoryTransaction'

export type RemoteAsset = {
  +amount: string,
  +assetId: string,
  +policyId: string,
  +name: string,
}
// this is equivalent to yoroi-frontend's `RemoteUnspentOutput`
export type RawUtxo = {|
  +amount: string,
  +receiver: string,
  +tx_hash: string,
  +tx_index: number,
  +utxo_id: string,
  +assets: $ReadOnlyArray<RemoteAsset>,
|}

export const CERTIFICATE_KIND = {
  STAKE_REGISTRATION: 'StakeRegistration',
  STAKE_DEREGISTRATION: 'StakeDeregistration',
  STAKE_DELEGATION: 'StakeDelegation',
  POOL_REGISTRATION: 'PoolRegistration',
  POOL_RETIREMENT: 'PoolRetirement',
  MOVE_INSTANTANEOUS_REWARDS: 'MoveInstantaneousRewardsCert',
}
export type CertificateKind = $Values<typeof CERTIFICATE_KIND>

// getAccountState

export type AccountStateRequest = {|
  addresses: Array<string>,
|}
export type RemoteAccountState = {|
  poolOperator: null, // not implemented yet
  remainingAmount: string, // current remaining awards
  rewards: string, // all the rewards every added
  withdrawals: string, // all the withdrawals that have ever happened
|}
export type AccountStateResponse = {|
  [key: string]: null | RemoteAccountState,
|}

// getPoolInfo

export type RemoteCertificate = {|
  kind: 'PoolRegistration' | 'PoolRetirement',
  certIndex: number,
  poolParams: Object, // don't think this is relevant
|}

export type RemotePoolMetaSuccess = {|
  info: ?{
    name?: string,
    ticker?: string,
    description?: string,
    homepage?: string,
    // other stuff from SMASH.
  },
  history: Array<{|
    epoch: number,
    slot: number,
    tx_ordinal: number,
    cert_ordinal: number,
    payload: RemoteCertificate,
  |}>,
|}

export type RemotePoolMetaFailure = {|
  error: Object,
|}

export type PoolInfoRequest = {|
  poolIds: Array<string>,
|}

export type PoolInfoResponse = {
  [key: string]: RemotePoolMetaSuccess | RemotePoolMetaFailure,
}

// getTxsBodiesForUTXOs

export type TxBodiesRequest = {|txsHashes: Array<string>|}
export type TxBodiesResponse = {[key: string]: string}

// reputation

export type ReputationObject = {
  node_flags?: number,
  // note: could be more metrics that are not handled
}
export type ReputationResponse = {[poolId: string]: ReputationObject}

// serverstatus

export type ServerStatusResponse = {|
  isServerOk: boolean,
  isMaintenance: boolean,
|}

// bestblock

export type BestblockResponse = {|
  height: number,
  epoch: ?number,
  slot: ?number,
  hash: ?string,
|}

// tx history

export type TxHistoryRequest = {|
  addresses: Array<string>,
  untilBlock: string,
  after?: {
    block: string,
    tx: string,
  },
|}

export type RemoteTransactionInputBase = {|
  +address: string,
  +amount: string,
  +assets: $ReadOnlyArray<RemoteAsset>,
|}

export type RemoteTransactionUtxoInput = {|
  +id: string, // concatenation of txHash || index
  +index: number,
  +txHash: string,
|}

// not considering acount txs for now
export type RemoteTransactionInput = {|
  ...RemoteTransactionInputBase,
  ...RemoteTransactionUtxoInput,
|}

export type RemoteTransactionOutput = {|
  +address: string,
  +amount: string,
  +assets: $ReadOnlyArray<RemoteAsset>,
|}

/**
 * only present if TX is in a block
 */
export type RemoteTxBlockMeta = {|
  +block_num: number,
  +block_hash: string,
  +tx_ordinal: number,
  +time: string, // timestamp with timezone
  +epoch: number,
  +slot: number,
|}

// See complete types in:
// https://github.com/Emurgo/yoroi-graphql-migration-backend#output-6
export type RemoteCertificateMeta =
  | {|
      kind: typeof CERTIFICATE_KIND.STAKE_REGISTRATION,
      rewardAddress: string, // hex
    |}
  | {|
      kind: typeof CERTIFICATE_KIND.STAKE_DEREGISTRATION,
      rewardAddress: string, // hex
    |}
  | {|
      kind: typeof CERTIFICATE_KIND.STAKE_DELEGATION,
      rewardAddress: string, // hex
      poolKeyHash: string, // hex
    |}
  | {|
      kind: typeof CERTIFICATE_KIND.POOL_REGISTRATION,
      poolParams: Object, // we don't care about this for now
    |}
  | {|
      kind: typeof CERTIFICATE_KIND.POOL_RETIREMENT,
      poolKeyHash: string, // hex
    |}
  | {|
      kind: typeof CERTIFICATE_KIND.MOVE_INSTANTANEOUS_REWARDS,
      rewards: {[addresses: string]: string},
      pot: 0 | 1,
    |}
export type RemoteTxInfo = {|
  +type: 'byron' | 'shelley',
  +fee?: string, // only in shelley txs
  +hash: string,
  +last_update: string, // timestamp with timezone
  +tx_state: TransactionStatus,
  +inputs: Array<RemoteTransactionInput>,
  +outputs: Array<RemoteTransactionOutput>,
  +withdrawals: Array<{|
    address: string, // hex
    amount: string,
  |}>,
  +certificates: Array<RemoteCertificateMeta>,
|}

export type RawTransaction = {|
  ...WithNullableFields<RemoteTxBlockMeta>,
  ...RemoteTxInfo,
|}
