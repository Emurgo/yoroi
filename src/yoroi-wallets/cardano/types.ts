import {BigNumber} from 'bignumber.js'
import type {IntlShape} from 'react-intl'

import {WalletEncryptedStorage} from '../../auth'
import type {HWDeviceInfo} from '../../legacy/ledgerUtils'
import {
  AccountStates,
  StakePoolInfoRequest,
  StakePoolInfosAndHistories,
  StakingInfo,
  StakingStatus,
  TransactionInfo,
  YoroiNft,
  YoroiNftModerationStatus,
  YoroiSignedTx,
  YoroiUnsignedTx,
} from '../types'
import type {
  CurrencySymbol,
  EncryptionMethod,
  FundInfoResponse,
  RawUtxo,
  TipStatusResponse,
  Transaction,
  TxStatusRequest,
  TxStatusResponse,
  WalletState,
} from '../types/other'
import {DefaultAsset, SendTokenList, TokenInfo} from '../types/tokens'
import {CardanoTypes} from '.'
import type {Addresses} from './chain'
import {AddressChain} from './chain'

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

  fetchTokenInfo(tokenId: string): Promise<TokenInfo>

  fetchFundInfo(): Promise<FundInfoResponse>

  fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse>

  fetchTipStatus(): Promise<TipStatusResponse>

  fetchCurrentPrice(symbol: CurrencySymbol): Promise<number>

  fetchNfts(): Promise<YoroiNft[]>

  fetchNftModerationStatus(fingerprint: string): Promise<YoroiNftModerationStatus>

  sync(): Promise<void>

  resync(): Promise<void>
}

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
  primaryTokenInfo: Readonly<TokenInfo>
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
  | 'publicKeyHex'
  | 'rewardAddressHex'
  | 'save'
  | 'signTxWithLedger'
  | 'subscribeOnTxHistoryUpdate'
  | 'toJSON'
  | 'fetchNfts'
  | 'fetchNftModerationStatus'
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
  'fetchNfts',
  'fetchNftModerationStatus',
  'internalAddresses',
  'isEasyConfirmationEnabled',
  'isHW',
  'isReadOnly',
  'isUsedAddressIndex',
  'numReceiveAddresses',
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
