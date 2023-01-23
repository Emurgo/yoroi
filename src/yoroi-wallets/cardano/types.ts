import {BigNumber} from 'bignumber.js'
import type {IntlShape} from 'react-intl'

import {WalletEncryptedStorage} from '../../auth'
import {HWDeviceInfo} from '../ledgerUtils'
import {EncryptionMethod, YoroiSignedTx, YoroiUnsignedTx} from '../types'
import {
  AccountStates,
  AddressChain,
  Addresses,
  CardanoTypes,
  CurrencySymbol,
  DefaultAsset,
  FundInfoResponse,
  MultiToken,
  RemoteCertificateMeta,
  SendTokenList,
  StakePoolInfoRequest,
  StakePoolInfosAndHistories,
  StakingInfo,
  StakingStatus,
  TipStatusResponse,
  Token,
  TokenEntry,
  TokenEntryPlain,
  TokenInfo,
} from '.'
import {WALLET_IMPLEMENTATION_REGISTRY} from './config'
import {NETWORK_REGISTRY} from './networks'

export type WalletEvent =
  | {type: 'initialize'}
  | {type: 'easy-confirmation'; enabled: boolean}
  | {type: 'transactions'; transactions: Record<string, Transaction>}
  | {type: 'addresses'; addresses: Addresses}
  | {type: 'state'; state: WalletState}
  | {type: 'utxos'; utxos: RawUtxo[]}

export type WalletSubscription = (event: WalletEvent) => void
export type Unsubscribe = () => void
export interface WalletInterface {
  readonly id: string
  readonly networkId: NetworkId
  readonly walletImplementationId: WalletImplementationId
  readonly isHW: boolean
  readonly isReadOnly: boolean
  readonly provider: null | undefined | YoroiProvider
  readonly internalChain: AddressChain
  readonly externalChain: AddressChain
  readonly publicKeyHex: string
  rewardAddressHex: null | string
  hwDeviceInfo: null | HWDeviceInfo

  // last known version the wallet has been opened on
  // note: Prior to v4.1.0, `version` was set upon wallet creation/restoration
  // and was never updated. Starting from v4.1.0, we instead store the
  // last version the wallet has been *opened* on, since this is the actual
  // relevant information we need to decide on whether migrations are needed.

  readonly checksum: CardanoTypes.WalletChecksum
  utxos: Array<RawUtxo>
  isEasyConfirmationEnabled: boolean

  // =================== getters =================== //

  get internalAddresses(): Addresses

  get externalAddresses(): Addresses

  get isUsedAddressIndex(): Record<string, boolean>

  get numReceiveAddresses(): number

  get transactions(): Record<string, Transaction>

  get confirmationCounts(): Record<string, null | number>

  get receiveAddresses(): Addresses

  // ============ security & key management ============ //

  encryptAndSaveRootKey(encryptionMethod: EncryptionMethod, rootKey: string, password: string): Promise<void>

  enableEasyConfirmation(rootKey: string): Promise<void>
  disableEasyConfirmation(): Promise<void>

  changePassword(rootPassword: string, newPassword: string, intl: IntlShape): Promise<void>

  // =================== subscriptions =================== //

  subscribe(handler: (event: WalletEvent) => void): () => void
  subscribeOnTxHistoryUpdate(handler: () => void): () => void

  // =================== synch =================== //

  tryDoFullSync(): Promise<void>

  // =================== persistence =================== //

  save(): Promise<void>

  clear(): Promise<void>

  // TODO: type
  toJSON(): unknown

  // =================== tx building =================== //

  getAllUtxosForKey(): Promise<Array<CardanoTypes.CardanoAddressedUtxo>>

  getDelegationStatus(): Promise<StakingStatus>

  createUnsignedTx(
    receiver: string,
    tokens: SendTokenList,
    metadata?: Array<CardanoTypes.TxMetadata>,
  ): Promise<YoroiUnsignedTx>

  signTx(signRequest: YoroiUnsignedTx, rootKey: string): Promise<YoroiSignedTx>

  createDelegationTx(poolRequest: string, valueInAccount: BigNumber): Promise<YoroiUnsignedTx>

  createVotingRegTx(pin: string): Promise<{votingRegTx: YoroiUnsignedTx; votingKeyEncrypted: string}>

  createWithdrawalTx(shouldDeregister: boolean): Promise<YoroiUnsignedTx>

  signTxWithLedger(request: YoroiUnsignedTx, useUSB: boolean): Promise<YoroiSignedTx>

  canGenerateNewReceiveAddress(): boolean

  generateNewReceiveAddressIfNeeded(): boolean

  generateNewReceiveAddress(): boolean

  // =================== backend API =================== //

  checkServerStatus(): Promise<ServerStatus>

  submitTransaction(signedTx: string): Promise<[]>

  fetchAccountState(): Promise<AccountStates>

  fetchPoolInfo(request: StakePoolInfoRequest): Promise<StakePoolInfosAndHistories>

  fetchTokenInfo(request: {tokenIds: Array<string>}): Promise<Record<string, TokenInfo | null>>

  fetchFundInfo(): Promise<FundInfoResponse>

  fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse>

  fetchTipStatus(): Promise<TipStatusResponse>

  fetchCurrentPrice(symbol: CurrencySymbol): Promise<number>

  sync(): Promise<void>

  resync(): Promise<void>
}

export type WalletImplementation = {
  WALLET_IMPLEMENTATION_ID: WalletImplementationId
  TYPE: 'bip44' | 'cip1852'
  MNEMONIC_LEN: number
  DISCOVERY_GAP_SIZE: number
  DISCOVERY_BLOCK_SIZE: number
  MAX_GENERATED_UNUSED: number
}

export type WalletImplementationId = typeof WALLET_IMPLEMENTATION_REGISTRY[keyof typeof WALLET_IMPLEMENTATION_REGISTRY]

export type NetworkId = typeof NETWORK_REGISTRY[keyof typeof NETWORK_REGISTRY]

export type YoroiProvider = '' | 'emurgo-alonzo'

export type ServerStatus = {
  isServerOk: boolean
  isMaintenance: boolean
  serverTime: number | undefined
  isQueueOnline?: boolean
}

export type Block = {
  height: number
  epoch: number
  slot: number
  hash: string
}

export type TxSubmissionStatus = {
  status: 'WAITING' | 'FAILED' | 'MAX_RETRY_REACHED' | 'SUCCESS'
  reason?: string | null
}

export type TxStatusResponse = {
  readonly depth?: Record<string, number>
  readonly submissionStatus?: Record<string, TxSubmissionStatus>
}

export type SignedTxLegacy = {
  id: string
  encodedTx: Uint8Array
  base64: string
}

export type YoroiWallet = Pick<WalletInterface, YoroiWalletKeys> & {
  id: string
  getTransactions: (txids: Array<string>) => Promise<{[txid: string]: TransactionInfo}>
  changePassword: (password: string, newPassword: string) => Promise<void>
  encryptedStorage: WalletEncryptedStorage
  sync: () => Promise<void>
  resync: () => Promise<void>
  signTx(unsignedTx: YoroiUnsignedTx, rootKey: string): Promise<YoroiSignedTx>
  submitTransaction: (signedTx: string) => Promise<[]>
  subscribe: (subscription: WalletSubscription) => Unsubscribe

  // NonNullable
  networkId: NonNullable<WalletInterface['networkId']>
  walletImplementationId: NonNullable<WalletInterface['walletImplementationId']>
  primaryToken: Readonly<DefaultAsset>
  checksum: NonNullable<WalletInterface['checksum']>
  isReadOnly: NonNullable<WalletInterface['isReadOnly']>
  rewardAddressHex: NonNullable<WalletInterface['rewardAddressHex']>
  getStakingInfo: () => Promise<StakingInfo>
}

export const isYoroiWallet = (wallet: unknown): wallet is YoroiWallet => {
  return !!wallet && typeof wallet === 'object' && yoroiWalletKeys.every((key) => key in wallet)
}

type YoroiWalletKeys =
  | 'changePassword'
  | 'checkServerStatus'
  | 'checksum'
  | 'confirmationCounts'
  | 'createDelegationTx'
  | 'createUnsignedTx'
  | 'createVotingRegTx'
  | 'createWithdrawalTx'
  | 'disableEasyConfirmation'
  | 'enableEasyConfirmation'
  | 'externalAddresses'
  | 'fetchAccountState'
  | 'fetchCurrentPrice'
  | 'fetchFundInfo'
  | 'fetchPoolInfo'
  | 'fetchTipStatus'
  | 'fetchTokenInfo'
  | 'fetchTxStatus'
  | 'getAllUtxosForKey'
  | 'getDelegationStatus'
  | 'hwDeviceInfo'
  | 'internalAddresses'
  | 'isEasyConfirmationEnabled'
  | 'isHW'
  | 'isReadOnly'
  | 'isUsedAddressIndex'
  | 'numReceiveAddresses'
  | 'provider'
  | 'publicKeyHex'
  | 'rewardAddressHex'
  | 'save'
  | 'signTxWithLedger'
  | 'subscribeOnTxHistoryUpdate'
  | 'toJSON'
  | 'transactions'
  | 'utxos'
  | 'walletImplementationId'
  | 'receiveAddresses'
  | 'canGenerateNewReceiveAddress'
  | 'generateNewReceiveAddressIfNeeded'
  | 'generateNewReceiveAddress'
  | 'tryDoFullSync'
  | 'clear'

const yoroiWalletKeys: Array<YoroiWalletKeys> = [
  'changePassword',
  'checkServerStatus',
  'checksum',
  'confirmationCounts',
  'createDelegationTx',
  'createUnsignedTx',
  'createVotingRegTx',
  'createWithdrawalTx',
  'disableEasyConfirmation',
  'enableEasyConfirmation',
  'externalAddresses',
  'fetchAccountState',
  'fetchCurrentPrice',
  'fetchFundInfo',
  'fetchPoolInfo',
  'fetchTipStatus',
  'fetchTokenInfo',
  'fetchTxStatus',
  'getAllUtxosForKey',
  'getDelegationStatus',
  'hwDeviceInfo',
  'internalAddresses',
  'isEasyConfirmationEnabled',
  'isHW',
  'isReadOnly',
  'isUsedAddressIndex',
  'numReceiveAddresses',
  'provider',
  'publicKeyHex',
  'rewardAddressHex',
  'save',
  'signTxWithLedger',
  'subscribeOnTxHistoryUpdate',
  'toJSON',
  'transactions',
  'utxos',
  'walletImplementationId',
  'tryDoFullSync',
  'clear',
]

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

export type TxStatusRequest = {
  txHashes: Array<string>
}

// these are the different wallet implementations we have/had

export type BackendConfig = {
  API_ROOT: string
  TOKEN_INFO_SERVICE?: string
  FETCH_UTXOS_MAX_ADDRESSES: number
  TX_HISTORY_MAX_ADDRESSES: number
  FILTER_USED_MAX_ADDRESSES: number
  TX_HISTORY_RESPONSE_LIMIT: number
}

export type IOData = {
  address: string
  assets: Array<TokenEntry>
  amount: string
}

export type BaseAsset = RemoteAsset

export const TRANSACTION_TYPE = {
  BYRON: 'byron',
  SHELLEY: 'shelley',
}

export type Transaction = {
  id: string
  type?: TransactionType
  fee?: string
  status: TransactionStatus
  inputs: Array<{
    address: string
    amount: string
    assets: Array<BaseAsset>
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
}

export type CommonMetadata = {
  readonly numberOfDecimals: number
  readonly ticker: null | string
  readonly longName: null | string
  readonly maxSupply: null | string
}

export type TransactionType = typeof TRANSACTION_TYPE[keyof typeof TRANSACTION_TYPE]

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
}

export type Value = {
  values: MultiToken
}

export type Addressing = {
  readonly addressing: {
    readonly path: Array<number>
    readonly startLevel: number
  }
}

export type WalletState = {
  lastGeneratedAddressIndex: number
}

export type PlateResponse = {
  addresses: Array<string>
  accountPlate: CardanoTypes.WalletChecksum
}
export type ProtocolParameters = {
  readonly linearFee: CardanoTypes.LinearFee
  readonly minimumUtxoVal: CardanoTypes.BigNum
  readonly poolDeposit: CardanoTypes.BigNum
  readonly keyDeposit: CardanoTypes.BigNum
  readonly networkId: number
  readonly maxValueBytes?: number
  readonly maxTxBytes?: number
}

export type RemoteAsset = {
  readonly amount: string
  readonly assetId: string
  readonly policyId: string
  readonly name: string
}

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

export type RemotePoolMetaFailure = {
  error: Record<string, unknown>
}

export const TRANSACTION_DIRECTION = {
  SENT: 'SENT',
  RECEIVED: 'RECEIVED',
  SELF: 'SELF',
  // intra-wallet
  MULTI: 'MULTI', // multi-party
}

export type TransactionDirection = typeof TRANSACTION_DIRECTION[keyof typeof TRANSACTION_DIRECTION]

export type TransactionAssurance = 'PENDING' | 'FAILED' | 'LOW' | 'MEDIUM' | 'HIGH'

export type TransactionStatus = typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS]

export const TRANSACTION_STATUS = {
  SUCCESSFUL: 'Successful',
  PENDING: 'Pending',
  FAILED: 'Failed',
}

export type ServerStatusResponse = {
  isServerOk: boolean
  isMaintenance: boolean
  serverTime: number
  // in milliseconds
  isQueueOnline?: boolean
}

export type ReputationResponse = Record<string, ReputationObject>

export type ReputationObject = {
  node_flags?: number // note: could be more metrics that are not handled
}

export type AddressObj = {
  readonly address: string
}
