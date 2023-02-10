import {BigNumber} from 'bignumber.js'

import {WalletEncryptedStorage} from '../../auth'
import type {HWDeviceInfo} from '../../legacy/ledgerUtils'
import {
  AccountStates,
  StakePoolInfoRequest,
  StakePoolInfosAndHistories,
  StakingInfo,
  StakingStatus,
  YoroiSignedTx,
  YoroiUnsignedTx,
} from '../types'
import type {
  CurrencySymbol,
  FundInfoResponse,
  RawUtxo,
  TipStatusResponse,
  TransactionInfo,
  TxStatusRequest,
  TxStatusResponse,
  WalletState,
} from '../types/other'
import {DefaultAsset, SendTokenList, TokenInfo} from '../types/tokens'
import {CardanoTypes} from '.'
import type {Addresses} from './chain'

export type WalletEvent =
  | {type: 'initialize'}
  | {type: 'easy-confirmation'; enabled: boolean}
  | {type: 'transactions'; transactions: Record<string, TransactionInfo>}
  | {type: 'addresses'; addresses: Addresses}
  | {type: 'state'; state: WalletState}
  | {type: 'utxos'; utxos: RawUtxo[]}

export type WalletSubscription = (event: WalletEvent) => void
export type Unsubscribe = () => void

export type WalletImplementation = {
  WALLET_IMPLEMENTATION_ID: 'haskell-byron' | 'haskell-shelley' | 'haskell-shelley-24' | 'jormungandr-itn' | ''
  TYPE: 'bip44' | 'cip1852'
  MNEMONIC_LEN: number
  DISCOVERY_GAP_SIZE: number
  DISCOVERY_BLOCK_SIZE: number
  MAX_GENERATED_UNUSED: number
}

export type WalletImplementationId = WalletImplementation['WALLET_IMPLEMENTATION_ID']

export type NetworkId = number

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

export type SignedTxLegacy = {
  id: string
  encodedTx: Uint8Array
  base64: string
}

export type YoroiWallet = {
  id: string

  publicKeyHex: string
  checksum: CardanoTypes.WalletChecksum
  networkId: NetworkId
  walletImplementationId: WalletImplementationId
  isHW: boolean
  hwDeviceInfo: null | HWDeviceInfo
  isReadOnly: boolean
  primaryToken: Readonly<DefaultAsset>
  primaryTokenInfo: Readonly<TokenInfo>

  // Sending
  createUnsignedTx(
    receiver: string,
    tokens: SendTokenList,
    metadata?: Array<CardanoTypes.TxMetadata>,
  ): Promise<YoroiUnsignedTx>
  signTxWithLedger(request: YoroiUnsignedTx, useUSB: boolean): Promise<YoroiSignedTx>
  signTx(signRequest: YoroiUnsignedTx, rootKey: string): Promise<YoroiSignedTx>
  submitTransaction(signedTx: string): Promise<[]>

  // Voting
  createVotingRegTx(pin: string): Promise<{votingRegTx: YoroiUnsignedTx; votingKeyEncrypted: string}>
  fetchFundInfo(): Promise<FundInfoResponse>

  // Staking
  rewardAddressHex: string
  createDelegationTx(poolRequest: string, valueInAccount: BigNumber): Promise<YoroiUnsignedTx>
  createWithdrawalTx(shouldDeregister: boolean): Promise<YoroiUnsignedTx>
  getDelegationStatus(): Promise<StakingStatus>
  getAllUtxosForKey(): Promise<Array<CardanoTypes.CardanoAddressedUtxo>>
  getStakingInfo: () => Promise<StakingInfo>
  fetchAccountState(): Promise<AccountStates>
  fetchPoolInfo(request: StakePoolInfoRequest): Promise<StakePoolInfosAndHistories>

  // Password
  encryptedStorage: WalletEncryptedStorage
  changePassword: (password: string, newPassword: string) => Promise<void>

  // EasyConfirmation
  isEasyConfirmationEnabled: boolean
  disableEasyConfirmation(): Promise<void>
  enableEasyConfirmation(rootKey: string): Promise<void>

  // Addresses
  get externalAddresses(): Addresses
  get internalAddresses(): Addresses
  get isUsedAddressIndex(): Record<string, boolean>
  get numReceiveAddresses(): number
  get receiveAddresses(): Addresses
  canGenerateNewReceiveAddress(): boolean
  generateNewReceiveAddress(): boolean
  generateNewReceiveAddressIfNeeded(): boolean

  // Sync, Save
  resync(): Promise<void>
  clear(): Promise<void>
  tryDoFullSync(): Promise<void>
  save(): Promise<void>
  sync(): Promise<void>
  startSync: () => void
  stopSync: () => void
  saveMemo(txId: string, memo: string): Promise<void>

  // Balances, TxDetails
  get transactions(): Record<string, TransactionInfo>
  get confirmationCounts(): Record<string, null | number>
  fetchTipStatus(): Promise<TipStatusResponse>
  fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse>
  fetchTokenInfo(tokenId: string): Promise<TokenInfo>

  // Fiat
  fetchCurrentPrice(symbol: CurrencySymbol): Promise<number>

  // Other
  subscribe: (subscription: WalletSubscription) => Unsubscribe
  subscribeOnTxHistoryUpdate(handler: () => void): () => void
  checkServerStatus(): Promise<ServerStatus>
  utxos: Array<RawUtxo>
}

export const isYoroiWallet = (wallet: unknown): wallet is YoroiWallet => {
  return !!wallet && typeof wallet === 'object' && yoroiWalletKeys.every((key) => key in wallet)
}

const yoroiWalletKeys: Array<keyof YoroiWallet> = [
  'id',
  'publicKeyHex',
  'checksum',
  'networkId',
  'walletImplementationId',
  'isHW',
  'hwDeviceInfo',
  'isReadOnly',
  'primaryToken',
  'primaryTokenInfo',

  // Sending
  'createUnsignedTx',
  'signTxWithLedger',
  'signTx',
  'submitTransaction',

  // Voting
  'createVotingRegTx',
  'fetchFundInfo',

  // Staking
  'rewardAddressHex',
  'createDelegationTx',
  'createWithdrawalTx',
  'getDelegationStatus',
  'getAllUtxosForKey',
  'getStakingInfo',
  'fetchAccountState',
  'fetchPoolInfo',

  // Password
  'encryptedStorage',
  'changePassword',

  // EasyConfirmation
  'isEasyConfirmationEnabled',
  'disableEasyConfirmation',
  'enableEasyConfirmation',

  // Addresses
  'externalAddresses',
  'internalAddresses',
  'isUsedAddressIndex',
  'numReceiveAddresses',
  'receiveAddresses',
  'canGenerateNewReceiveAddress',
  'generateNewReceiveAddress',
  'generateNewReceiveAddressIfNeeded',

  // Sync, Save
  'resync',
  'clear',
  'tryDoFullSync',
  'save',
  'sync',
  'startSync',
  'stopSync',
  'saveMemo',

  // Balances, TxDetails
  'transactions',
  'confirmationCounts',
  'fetchTipStatus',
  'fetchTxStatus',
  'fetchTokenInfo',

  // Fiat
  'fetchCurrentPrice',

  // Other
  'subscribe',
  'subscribeOnTxHistoryUpdate',
  'checkServerStatus',
  'utxos',
]
