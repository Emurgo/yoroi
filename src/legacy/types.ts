/* eslint-disable @typescript-eslint/no-explicit-any */
import type {WalletChecksum} from '@emurgo/cip4-js'

import {TokenInfo} from '../types'

export type Addressing = {
  readonly addressing: {
    readonly path: Array<number>
    readonly startLevel: number
  }
}
// equivalent to CardanoAddressedUtxo in the Yoroi extension
export type AddressedUtxo = RawUtxo & Addressing
// Byron-era Types

/**
 * Haskell-Shelley-era tx types
 */

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
// Pricing api
export const supportedCurrencies = Object.freeze({
  ADA: 'ADA',
  BRL: 'BRL',
  BTC: 'BTC',
  CNY: 'CNY',
  ETH: 'ETH',
  EUR: 'EUR',
  JPY: 'JPY',
  KRW: 'KRW',
  USD: 'USD',
})
export type CurrencySymbol = keyof typeof supportedCurrencies
export type ConfigCurrencies = typeof configCurrencies
export const configCurrencies = {
  [supportedCurrencies.ADA]: {
    decimals: 6,
    nativeName: 'Cardano',
  },
  [supportedCurrencies.BRL]: {
    decimals: 2,
    nativeName: 'Real',
  },
  [supportedCurrencies.BTC]: {
    decimals: 4,
    nativeName: 'Bitcoin',
  },
  [supportedCurrencies.CNY]: {
    decimals: 2,
    nativeName: '人民币',
  },
  [supportedCurrencies.ETH]: {
    decimals: 4,
    nativeName: 'Ethereum',
  },
  [supportedCurrencies.EUR]: {
    decimals: 2,
    nativeName: 'Euro',
  },
  [supportedCurrencies.JPY]: {
    decimals: 2,
    nativeName: '日本円',
  },
  [supportedCurrencies.KRW]: {
    decimals: 2,
    nativeName: '대한민국 원',
  },
  [supportedCurrencies.USD]: {
    decimals: 2,
    nativeName: 'US Dollar',
  },
}
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
  JORMUNGANDR: 100,
  // ERGO: 200,
  HASKELL_SHELLEY_TESTNET: 300,
  UNDEFINED: -1,
}
export type NetworkId = typeof NETWORK_REGISTRY[keyof typeof NETWORK_REGISTRY]

// PROVIDERS
export const ALONZO_FACTOR = 1000

export const YOROI_PROVIDER_IDS = {
  ...NETWORK_REGISTRY,
  ALONZO_MAINNET: ALONZO_FACTOR + NETWORK_REGISTRY.HASKELL_SHELLEY,
  ALONZO_TESTNET: ALONZO_FACTOR + NETWORK_REGISTRY.HASKELL_SHELLEY_TESTNET,
}

export type YoroiProvider = '' | 'emurgo-alonzo'

export const DERIVATION_TYPES = {
  BIP44: 'bip44',
  CIP1852: 'cip1852',
}
export type DerivationType = typeof DERIVATION_TYPES[keyof typeof DERIVATION_TYPES]

// these are the different wallet implementations we have/had
export const WALLET_IMPLEMENTATION_REGISTRY = {
  HASKELL_BYRON: 'haskell-byron', // bip44
  HASKELL_SHELLEY: 'haskell-shelley', // cip1852/15 words
  HASKELL_SHELLEY_24: 'haskell-shelley-24', // cip1852/24 words
  JORMUNGANDR_ITN: 'jormungandr-itn', // deprecated
  // ERGO: 'ergo',
  UNDEFINED: '',
} as const
export type WalletImplementationId = typeof WALLET_IMPLEMENTATION_REGISTRY[keyof typeof WALLET_IMPLEMENTATION_REGISTRY]

export type WalletImplementation = {
  WALLET_IMPLEMENTATION_ID: WalletImplementationId
  TYPE: DerivationType
  MNEMONIC_LEN: number
  DISCOVERY_GAP_SIZE: number
  DISCOVERY_BLOCK_SIZE: number
  MAX_GENERATED_UNUSED: number
}

export type BackendConfig = {
  API_ROOT: string
  TOKEN_INFO_SERVICE?: string
  FETCH_UTXOS_MAX_ADDRESSES: number
  TX_HISTORY_MAX_ADDRESSES: number
  FILTER_USED_MAX_ADDRESSES: number
  TX_HISTORY_RESPONSE_LIMIT: number
}
