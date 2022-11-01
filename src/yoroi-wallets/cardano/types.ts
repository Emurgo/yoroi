import {BigNumber} from 'bignumber.js'
import type {IntlShape} from 'react-intl'

import type {HWDeviceInfo} from '../../legacy/ledgerUtils'
import {WalletMeta} from '../../legacy/state'
import storage from '../../legacy/storage'
import {
  AccountStates,
  StakePoolInfoRequest,
  StakePoolInfosAndHistories,
  StakingStatus,
  YoroiSignedTx,
  YoroiUnsignedTx,
} from '../types'
import type {
  AddressedUtxo,
  CurrencySymbol,
  FundInfoResponse,
  RawUtxo,
  TipStatusResponse,
  Transaction,
  TransactionInfo,
  TxBodiesRequest,
  TxBodiesResponse,
  TxStatusRequest,
  TxStatusResponse,
} from '../types/other'
import type {EncryptionMethod, WalletState} from '../types/other'
import {DefaultAsset, SendTokenList, TokenInfo} from '../types/tokens'
import {WalletEvent} from '../Wallet'
import {CardanoTypes} from '.'
import type {Addresses} from './chain'
import {AddressChain} from './chain'
import {TransactionCache} from './shelley/transactionCache'

export interface WalletInterface {
  id: null | string

  networkId: undefined | NetworkId

  walletImplementationId: undefined | WalletImplementationId

  isHW: boolean

  hwDeviceInfo: null | HWDeviceInfo

  isReadOnly: undefined | boolean

  provider: null | undefined | YoroiProvider

  isEasyConfirmationEnabled: boolean

  internalChain: null | AddressChain

  externalChain: null | AddressChain

  // note: currently not exposed to redux's store
  publicKeyHex: undefined | string

  // note: exposed to redux's store but not in storage (as it can be derived)
  rewardAddressHex: null | string

  // last known version the wallet has been opened on
  // note: Prior to v4.1.0, `version` was set upon wallet creation/restoration
  // and was never updated. Starting from v4.1.0, we instead store the
  // last version the wallet has been *opened* on, since this is the actual
  // relevant information we need to decide on whether migrations are needed.
  // Saved in storage but not exposed to redux's store.
  version: undefined | string

  state: WalletState

  isInitialized: boolean

  transactionCache: null | TransactionCache

  checksum: undefined | CardanoTypes.WalletChecksum

  storage: typeof storage

  // =================== getters =================== //

  get internalAddresses(): Addresses

  get externalAddresses(): Addresses

  get isUsedAddressIndex(): Record<string, boolean>

  get numReceiveAddresses(): number

  get transactions(): Record<string, Transaction>

  get confirmationCounts(): Record<string, null | number>

  // =================== create =================== //

  create(
    mnemonic: string,
    newPassword: string,
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    provider?: null | YoroiProvider,
  ): Promise<string>

  createWithBip44Account(
    accountPublicKey: string,
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    hwDeviceInfo: null | HWDeviceInfo,
    isReadOnly: boolean,
  ): Promise<string>

  // ============ security & key management ============ //

  encryptAndSaveRootKey(encryptionMethod: EncryptionMethod, rootKey: string, password?: string): Promise<void>

  getDecryptedRootKey(rootPassword: string, intl: IntlShape): Promise<string>

  enableEasyConfirmation(): Promise<void>

  changePassword(rootPassword: string, newPassword: string, intl: IntlShape): Promise<void>

  // =================== subscriptions =================== //

  subscribe(handler: (event: WalletEvent) => void): () => void
  subscribeOnTxHistoryUpdate(handler: () => void): () => void

  // =================== synch =================== //

  doFullSync(): Promise<void>

  tryDoFullSync(): Promise<void>

  // =================== state/UI =================== //

  canGenerateNewReceiveAddress(): boolean

  generateNewUiReceiveAddressIfNeeded(): boolean

  generateNewUiReceiveAddress(): boolean

  // =================== persistence =================== //

  save(): Promise<void>

  clear(): Promise<void>

  // TODO: type
  toJSON(): unknown

  restore(data: unknown, walletMeta: WalletMeta): Promise<void>

  // =================== tx building =================== //

  // not exposed to wallet manager, consider removing
  getChangeAddress(): string

  getAllUtxosForKey(): Promise<Array<AddressedUtxo>>

  getAddressing(address: string): unknown

  getAddressedUtxos(): Promise<Array<CardanoTypes.CardanoAddressedUtxo>>
  getLegacyAddressedUtxos(): Promise<Array<AddressedUtxo>>

  getDelegationStatus(): Promise<StakingStatus>

  createUnsignedTx(
    receiver: string,
    tokens: SendTokenList,
    metadata?: Array<CardanoTypes.TxMetadata>,
  ): Promise<YoroiUnsignedTx>

  signTx(signRequest: YoroiUnsignedTx, rootKey: string): Promise<YoroiSignedTx>

  createDelegationTx(poolRequest: string, valueInAccount: BigNumber): Promise<YoroiUnsignedTx>

  createVotingRegTx(): Promise<{votingRegTx: YoroiUnsignedTx; votingKeyEncrypted: string}>

  createWithdrawalTx(shouldDeregister: boolean): Promise<YoroiUnsignedTx>

  signTxWithLedger(request: YoroiUnsignedTx, useUSB: boolean): Promise<YoroiSignedTx>

  // =================== backend API =================== //

  checkServerStatus(): Promise<ServerStatus>

  submitTransaction(signedTx: string): Promise<[]>

  getTxsBodiesForUTXOs(request: TxBodiesRequest): Promise<TxBodiesResponse>

  fetchUTXOs(): Promise<Array<RawUtxo>>

  fetchAccountState(): Promise<AccountStates>

  fetchPoolInfo(request: StakePoolInfoRequest): Promise<StakePoolInfosAndHistories>

  fetchTokenInfo(request: {tokenIds: Array<string>}): Promise<Record<string, TokenInfo | null>>

  fetchFundInfo(): Promise<FundInfoResponse>

  fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse>

  fetchTipStatus(): Promise<TipStatusResponse>

  fetchCurrentPrice(symbol: CurrencySymbol): Promise<number>

  resync(): void
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

export type SignedTxLegacy = {
  id: string
  encodedTx: Uint8Array
  base64: string
}

export type YoroiWallet = Pick<WalletInterface, YoroiWalletKeys> & {
  id: NonNullable<WalletInterface['id']>
  networkId: NonNullable<WalletInterface['networkId']>
  walletImplementationId: NonNullable<WalletInterface['walletImplementationId']>
  defaultAsset: DefaultAsset
  checksum: NonNullable<WalletInterface['checksum']>
  isReadOnly: NonNullable<WalletInterface['isReadOnly']>
  rewardAddressHex: NonNullable<WalletInterface['rewardAddressHex']>
  getTransactions: (txids: Array<string>) => Promise<Record<string, TransactionInfo>>
  sync: () => Promise<void>
}

export const isYoroiWallet = (wallet: unknown): wallet is YoroiWallet => {
  return !!wallet && typeof wallet === 'object' && yoroiWalletKeys.every((key) => key in wallet)
}

type YoroiWalletKeys =
  | 'id'
  | 'networkId'
  | 'checksum'
  | 'provider'
  | 'isHW'
  | 'hwDeviceInfo'
  | 'isEasyConfirmationEnabled'
  | 'walletImplementationId'
  | 'isReadOnly'
  | 'fetchTokenInfo'
  | 'changePassword'
  | 'fetchTxStatus'
  | 'checkServerStatus'
  | 'subscribeOnTxHistoryUpdate'
  | 'getAllUtxosForKey'
  | 'fetchUTXOs'
  | 'fetchAccountState'
  | 'fetchTipStatus'
  | 'getDelegationStatus'
  | 'rewardAddressHex'
  | 'createUnsignedTx'
  | 'createDelegationTx'
  | 'createWithdrawalTx'
  | 'createVotingRegTx'
  | 'submitTransaction'
  | 'signTx'
  | 'signTxWithLedger'
  | 'fetchPoolInfo'
  | 'publicKeyHex'
  | 'subscribe'
  | 'toJSON'
  | 'fetchCurrentPrice'
  | 'fetchFundInfo'
  | 'internalAddresses'
  | 'externalAddresses'
  | 'confirmationCounts'
  | 'transactions'
  | 'isUsedAddressIndex'
  | 'numReceiveAddresses'
  | 'canGenerateNewReceiveAddress'
  | 'storage'
  | 'save'
  | 'doFullSync'

const yoroiWalletKeys: Array<YoroiWalletKeys> = [
  'id',
  'networkId',
  'checksum',
  'provider',
  'publicKeyHex',
  'isHW',
  'hwDeviceInfo',
  'isEasyConfirmationEnabled',
  'walletImplementationId',
  'isReadOnly',
  'fetchTokenInfo',
  'changePassword',
  'fetchTxStatus',
  'checkServerStatus',
  'subscribeOnTxHistoryUpdate',
  'getAllUtxosForKey',
  'fetchUTXOs',
  'fetchAccountState',
  'fetchTipStatus',
  'getDelegationStatus',
  'rewardAddressHex',
  'createUnsignedTx',
  'createDelegationTx',
  'createWithdrawalTx',
  'createVotingRegTx',
  'submitTransaction',
  'signTx',
  'signTxWithLedger',
  'fetchPoolInfo',
  'toJSON',
  'fetchCurrentPrice',
  'fetchFundInfo',
  'internalAddresses',
  'externalAddresses',
  'confirmationCounts',
  'transactions',
  'isUsedAddressIndex',
  'numReceiveAddresses',
  'canGenerateNewReceiveAddress',
  'storage',
  'save',
  'doFullSync',
]
