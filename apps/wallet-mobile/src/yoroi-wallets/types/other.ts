/* eslint-disable @typescript-eslint/no-explicit-any */
import {configCurrencies, supportedCurrencies} from '../../kernel/constants'
import {
  WALLET_CONFIG as HASKELL_SHELLEY,
  WALLET_CONFIG_24 as HASKELL_SHELLEY_24,
} from '../cardano/constants/mainnet/constants'
import {MultiToken, TokenEntryPlain} from '../cardano/MultiToken'
import {CardanoTypes} from '../cardano/types'
import {RemoteAccountState, RemoteCertificateMeta} from './staking'
import {Token} from './tokens'

export type AddressObj = {
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
export type Addressing = {
  readonly addressing: {
    readonly path: Array<number>
    readonly startLevel: number
  }
}
// equivalent to CardanoAddressedUtxo in the Yoroi extension
export type AddressedUtxo = RawUtxo & Addressing
// Byron-era Types
export type TransactionOutput = AddressObj & {
  value: string
}
export type TransactionInput = LegacyAddressing & {
  ptr: {
    id: string
    index: number
  }
  value: AddressObj & {
    value: string
  }
}

/**
 * wallet types
 */
export type WalletState = {
  lastGeneratedAddressIndex: number
}
export type PlateResponse = {
  addresses: Array<string>
  accountPlate: CardanoTypes.WalletChecksum
}

/**
 * API-related types
 */
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
export type CertificateKind = (typeof CERTIFICATE_KIND)[keyof typeof CERTIFICATE_KIND]
// getAccountState
export type AccountStateRequest = {
  addresses: Array<string>
}
export type AccountStateResponse = Record<string, null | RemoteAccountState>

export type PoolInfoRequest = {
  poolIds: Array<string>
}

// bestblock
export type BestblockResponse = {
  height: number
  epoch: number | null | undefined
  slot: number | null | undefined
  hash: string | null | undefined
  globalSlot: number | null | undefined
}
// tip status
export type TipStatusResponse = {
  safeBlock: BestblockResponse
  bestBlock: BestblockResponse
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
  readonly assets: Array<RemoteAsset>
}
export type RemoteTransactionUtxoInput = {
  readonly id: string
  // concatenation of txHash || index
  readonly index: number
  readonly txHash: string
}
// not considering account txs for now
export type RemoteTransactionInput = RemoteTransactionInputBase & RemoteTransactionUtxoInput
export type RemoteTransactionOutput = {
  readonly address: string
  readonly amount: string
  readonly assets: Array<RemoteAsset>
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
  readonly metadata?: TxMetadata
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
  readonly status: 'WAITING' | 'FAILED' | 'MAX_RETRY_REACHED' | 'SUCCESS'
  readonly reason?: string
}
export type TxStatusRequest = {
  txHashes: Array<string>
}
export type TxStatusResponse = {
  readonly depth?: Record<string, number>
  readonly submissionStatus?: Record<string, TxSubmissionStatus>
}
// Pricing api

export type CurrencySymbol = keyof typeof supportedCurrencies
export type ConfigCurrencies = typeof configCurrencies

export type PriceResponse = {
  error: string | null
  ticker: {
    from: 'ADA' // we don't support ERG yet
    timestamp: number
    signature: string
    prices: Record<CurrencySymbol, number>
  }
}
export const NETWORK_REGISTRY = {
  BYRON_MAINNET: 0,
  HASKELL_SHELLEY: 1,
  HASKELL_SHELLEY_TESTNET: 300,
  UNDEFINED: -1,
  SANCHONET: 450,
} as const
export type NetworkId = (typeof NETWORK_REGISTRY)[keyof typeof NETWORK_REGISTRY]

// PROVIDERS
export const ALONZO_FACTOR = 1000

export const YOROI_PROVIDER_IDS = {
  ...NETWORK_REGISTRY,
  ALONZO_MAINNET: ALONZO_FACTOR + NETWORK_REGISTRY.HASKELL_SHELLEY,
  ALONZO_TESTNET: ALONZO_FACTOR + NETWORK_REGISTRY.HASKELL_SHELLEY_TESTNET,
} as const

export const DERIVATION_TYPES = {
  BIP44: 'bip44',
  CIP1852: 'cip1852',
} as const

// these are the different wallet implementations we have/had
export const WALLET_IMPLEMENTATION_REGISTRY = {
  HASKELL_BYRON: 'haskell-byron', // bip44
  HASKELL_SHELLEY: HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID, // cip1852/15 words
  HASKELL_SHELLEY_24: HASKELL_SHELLEY_24.WALLET_IMPLEMENTATION_ID, // cip1852/24 words
  JORMUNGANDR_ITN: 'jormungandr-itn', // deprecated
  UNDEFINED: '',
} as const

export type WalletImplementationId =
  | typeof HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID
  | typeof HASKELL_SHELLEY_24.WALLET_IMPLEMENTATION_ID
  | typeof WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON
  | typeof WALLET_IMPLEMENTATION_REGISTRY.JORMUNGANDR_ITN
  | typeof WALLET_IMPLEMENTATION_REGISTRY.UNDEFINED

export type BackendConfig = {
  API_ROOT: string
  TOKEN_INFO_SERVICE?: string
  NFT_STORAGE_URL: string
  FETCH_UTXOS_MAX_ADDRESSES: number
  TX_HISTORY_MAX_ADDRESSES: number
  FILTER_USED_MAX_ADDRESSES: number
  TX_HISTORY_RESPONSE_LIMIT: number
}

export const TRANSACTION_STATUS = {
  SUCCESSFUL: 'Successful',
  PENDING: 'Pending',
  FAILED: 'Failed',
}
export type TransactionStatus = (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS]

export type TxMetadata = Array<{label: string; map_json?: any; text_scalar?: string | null}>
export type TxMetadataInfo = Record<string, any>

export type TransactionInfo = {
  id: string
  inputs: Array<IOData>
  outputs: Array<IOData>
  amount: Array<TokenEntryPlain>
  fee: Array<TokenEntryPlain> | null | undefined
  delta: Array<TokenEntryPlain>
  direction: TransactionDirection
  confirmations: number
  submittedAt: string | null | undefined
  lastUpdatedAt: string
  status: TransactionStatus
  assurance: TransactionAssurance
  tokens: Record<string, Token>
  blockNumber: number
  memo: null | string
  metadata: TxMetadataInfo | undefined
}

export type IOData = {
  address: string
  assets: Array<CardanoTypes.TokenEntry>
  amount: string
  id?: string
}

export type TransactionAssurance = 'PENDING' | 'FAILED' | 'LOW' | 'MEDIUM' | 'HIGH'

export const TRANSACTION_DIRECTION = {
  SENT: 'SENT',
  RECEIVED: 'RECEIVED',
  SELF: 'SELF',
  // intra-wallet
  MULTI: 'MULTI', // multi-party
} as const
export type TransactionDirection = (typeof TRANSACTION_DIRECTION)[keyof typeof TRANSACTION_DIRECTION]

export const TRANSACTION_TYPE = {
  BYRON: 'byron',
  SHELLEY: 'shelley',
}
export type TransactionType = (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE]
export type BaseAsset = RemoteAsset
export type Transactions = {[txid: string]: Transaction}
export type Transaction = {
  id: string
  type?: TransactionType
  fee?: string
  status: TransactionStatus
  inputs: Array<{
    address: string
    amount: string
    assets: Array<BaseAsset>
    id?: string
  }>
  outputs: Array<{
    address: string
    amount: string
    assets: Array<BaseAsset>
  }>
  blockNum: number | null | undefined
  blockHash: string | null | undefined
  txOrdinal: number | null | undefined
  submittedAt: string | null | undefined
  lastUpdatedAt: string
  epoch: number | null | undefined
  slot: number | null | undefined
  withdrawals: Array<{
    address: string
    // hex
    amount: string
  }>
  certificates: Array<RemoteCertificateMeta>
  readonly validContract?: boolean
  readonly scriptSize?: number
  readonly collateralInputs?: Array<{
    address: string
    amount: string
    assets: Array<BaseAsset>
  }>
  memo: string | null
  readonly metadata?: TxMetadata
}
