import type {WalletChecksum} from '@emurgo/cip4-js'
import {BigNumber} from 'bignumber.js'
import type {IntlShape} from 'react-intl'

import type {Transaction} from '../../legacy/HistoryTransaction'
import type {HWDeviceInfo} from '../../legacy/ledgerUtils'
import {WalletMeta} from '../../legacy/state'
import type {
  FundInfoResponse,
  RawUtxo,
  TxBodiesRequest,
  TxBodiesResponse,
  TxStatusRequest,
  TxStatusResponse,
} from '../../legacy/types'
import type {EncryptionMethod, WalletState} from '../../legacy/types'
import {
  AccountStates,
  AddressedUtxo,
  DefaultAsset,
  DefaultTokenEntry,
  SendTokenList,
  StakePoolInfoRequest,
  StakePoolInfosAndHistories,
  StakingStatus,
  TokenInfo,
} from '../../types'
import Wallet from '../Wallet'
import type {Addresses} from './chain'
import {AddressChain} from './chain'
import {HaskellShelleyTxSignRequest} from './HaskellShelleyTxSignRequest'
import type {JSONMetadata} from './metadataUtils'
import {MultiToken} from './MultiToken'
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

  checksum: undefined | WalletChecksum

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

  encryptAndSaveMasterKey(encryptionMethod: EncryptionMethod, masterKey: string, password?: string): Promise<void>

  getDecryptedMasterKey(masterPassword: string, intl: IntlShape): Promise<string>

  enableEasyConfirmation(masterPassword: string, intl: IntlShape): Promise<void>

  changePassword(masterPassword: string, newPassword: string, intl: IntlShape): Promise<void>

  // =================== subscriptions =================== //

  subscribe(handler: (wallet: Wallet) => void): void
  subscribeOnTxHistoryUpdate(handler: () => void): void

  // =================== synch =================== //

  doFullSync(): Promise<Record<string, Transaction>>

  tryDoFullSync(): Promise<Record<string, Transaction> | null>

  // =================== state/UI =================== //

  canGenerateNewReceiveAddress(): boolean

  generateNewUiReceiveAddressIfNeeded(): boolean

  generateNewUiReceiveAddress(): boolean

  // =================== persistence =================== //

  // TODO: type
  toJSON(): unknown

  restore(data: unknown, walletMeta: WalletMeta): Promise<void>

  // =================== tx building =================== //

  // not exposed to wallet manager, consider removing
  getChangeAddress(): string

  getAllUtxosForKey(utxos: Array<RawUtxo>): Promise<Array<AddressedUtxo>>

  getAddressingInfo(address: string): unknown

  asAddressedUtxo(utxos: Array<RawUtxo>): Array<AddressedUtxo>

  getDelegationStatus(): Promise<StakingStatus>

  createUnsignedTx(
    utxos: Array<RawUtxo>,
    receiver: string,
    tokens: SendTokenList,
    defaultToken: DefaultTokenEntry,
    serverTime: Date | null | void,
    metadata: Array<JSONMetadata> | void,
  ): Promise<HaskellShelleyTxSignRequest>

  signTx(signRequest: HaskellShelleyTxSignRequest, decryptedMasterKey: string): Promise<SignedTx>

  createDelegationTx(
    poolRequest: void | string,
    valueInAccount: BigNumber,
    utxos: Array<RawUtxo>,
    defaultAsset: DefaultAsset,
    serverTime: Date | void,
  ): Promise<{
    signRequest: HaskellShelleyTxSignRequest
    totalAmountToDelegate: MultiToken
  }>

  createVotingRegTx(
    utxos: Array<RawUtxo>,
    catalystPrivateKey: string,
    decryptedKey: string | void,
    serverTime: Date | void,
  ): Promise<HaskellShelleyTxSignRequest>

  createWithdrawalTx(
    utxos: Array<RawUtxo>,
    shouldDeregister: boolean,
    serverTime: Date | void,
  ): Promise<HaskellShelleyTxSignRequest>

  signTxWithLedger(request: HaskellShelleyTxSignRequest, useUSB: boolean): Promise<SignedTx>

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
  serverTime: Date | undefined
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

export type SignedTx = {
  id: string
  encodedTx: Uint8Array
  base64: string
}

export type YoroiWallet = Pick<WalletInterface, YoroiWalletKeys> & {
  id: NonNullable<WalletInterface['id']>
  networkId: NonNullable<WalletInterface['networkId']>
  walletImplementationId: NonNullable<WalletInterface['walletImplementationId']>
  checksum: NonNullable<WalletInterface['checksum']>
  isReadOnly: NonNullable<WalletInterface['isReadOnly']>
  rewardAddressHex: NonNullable<WalletInterface['rewardAddressHex']>
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
  | 'getDelegationStatus'
  | 'rewardAddressHex'
  | 'createDelegationTx'
  | 'createWithdrawalTx'
  | 'createVotingRegTx'
  | 'submitTransaction'
  | 'signTx'
  | 'signTxWithLedger'
  | 'fetchPoolInfo'
  | 'publicKeyHex'
  | 'subscribe'

const yoroiWalletKeys: Array<YoroiWalletKeys> = [
  'id',
  'networkId',
  'checksum',
  'provider',
  'publicKeyHex',
  'isHW',
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
  'getDelegationStatus',
  'rewardAddressHex',
  'createDelegationTx',
  'createWithdrawalTx',
  'createVotingRegTx',
  'submitTransaction',
  'signTx',
  'signTxWithLedger',
  'fetchPoolInfo',
]

export * from '@emurgo/yoroi-lib-core/dist/internals/wasm-contract'
import * as CardanoTypes from '@emurgo/yoroi-lib-core/dist/internals/wasm-contract'

export type TransactionBuilderCore = CardanoTypes.TransactionBuilder
