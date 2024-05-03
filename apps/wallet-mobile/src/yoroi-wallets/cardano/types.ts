import {WalletChecksum as WalletChecksumType} from '@emurgo/cip4-js'
import * as CoreTypes from '@emurgo/cross-csl-core'
import {BaseAddress, PrivateKey, TransactionUnspentOutput} from '@emurgo/cross-csl-core'
import {
  Addressing as AddressingType,
  CardanoAddressedUtxo as CardanoAddressedUtxoType,
  MultiTokenValue as MultiTokenValueType,
  SignedTx as SignedTxType,
  StakingKeyBalances as StakingKeyBalancesType,
  TokenEntry as TokenEntryType,
  TxMetadata as TxMetadataType,
  UnsignedTx as UnsignedTxType,
} from '@emurgo/yoroi-lib'
import {Api, App, Balance} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'

import {HWDeviceInfo} from '../hw'
import {WalletEncryptedStorage} from '../storage'
import {
  AccountStates,
  NetworkId,
  StakePoolInfoRequest,
  StakePoolInfosAndHistories,
  StakingInfo,
  StakingStatus,
  WalletImplementationId,
  YoroiEntry,
  YoroiNftModerationStatus,
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
import {DefaultAsset} from '../types/tokens'
import type {Addresses} from './chain'

export type WalletEvent =
  | {type: 'initialize'}
  | {type: 'easy-confirmation'; enabled: boolean}
  | {type: 'transactions'; transactions: Record<string, TransactionInfo>}
  | {type: 'addresses'; addresses: Addresses}
  | {type: 'state'; state: WalletState}
  | {type: 'utxos'; utxos: RawUtxo[]}
  | {type: 'collateral-id'; collateralId: RawUtxo['utxo_id']}

export type WalletSubscription = (event: WalletEvent) => void
export type Unsubscribe = () => void

export type WalletImplementation = {
  WALLET_IMPLEMENTATION_ID: WalletImplementationId
  TYPE: 'bip44' | 'cip1852'
  MNEMONIC_LEN: number
  DISCOVERY_GAP_SIZE: number
  DISCOVERY_BLOCK_SIZE: number
  MAX_GENERATED_UNUSED: number
}

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
  primaryTokenInfo: Readonly<Balance.TokenInfo>

  // API
  api: App.Api

  signRawTx(txHex: string, pKeys: PrivateKey[]): Promise<Uint8Array | undefined>

  // Sending
  createUnsignedTx(entries: YoroiEntry[], metadata?: Array<CardanoTypes.TxMetadata>): Promise<YoroiUnsignedTx>
  signTxWithLedger(request: YoroiUnsignedTx, useUSB: boolean): Promise<YoroiSignedTx>
  signTx(signRequest: YoroiUnsignedTx, rootKey: string): Promise<YoroiSignedTx>
  submitTransaction(signedTx: string): Promise<void>

  // Voting
  createVotingRegTx(
    pin: string,
    supportsCIP36: boolean,
  ): Promise<{votingRegTx: YoroiUnsignedTx; votingKeyEncrypted: string}>
  fetchFundInfo(): Promise<FundInfoResponse>

  // CIP36
  ledgerSupportsCIP36(useUSB: boolean): Promise<boolean>

  // Ledger
  signSwapCancellationWithLedger(cbor: string, useUSB: boolean): Promise<void>

  // Staking
  rewardAddressHex: string
  createDelegationTx(poolRequest: string, valueInAccount: BigNumber): Promise<YoroiUnsignedTx>
  createWithdrawalTx(shouldDeregister: boolean): Promise<YoroiUnsignedTx>
  getDelegationStatus(): Promise<StakingStatus>
  getAllUtxosForKey(): Promise<Array<CardanoTypes.CardanoAddressedUtxo>>
  getStakingInfo: () => Promise<StakingInfo>
  fetchAccountState(): Promise<AccountStates>
  fetchPoolInfo(request: StakePoolInfoRequest): Promise<StakePoolInfosAndHistories>
  getStakingKey: () => Promise<CardanoTypes.PublicKey>
  createUnsignedGovernanceTx(votingCertificates: CardanoTypes.Certificate[]): Promise<YoroiUnsignedTx>

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

  // NFTs
  fetchNftModerationStatus(fingerprint: string): Promise<YoroiNftModerationStatus>

  // Sync, Save
  resync(): Promise<void>
  clear(): Promise<void>
  save(): Promise<void>
  sync(): Promise<void>
  saveMemo(txId: string, memo: string): Promise<void>

  // Balances, TxDetails
  get transactions(): Record<string, TransactionInfo>
  get confirmationCounts(): Record<string, null | number>
  fetchTipStatus(): Promise<TipStatusResponse>
  fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse>
  fetchTokenInfo(tokenId: string): Promise<Balance.TokenInfo>
  utxos: Array<RawUtxo>
  allUtxos: Array<RawUtxo>
  get collateralId(): string
  getCollateralInfo(): {
    utxo: RawUtxo | undefined
    amount: Balance.Amount
    collateralId: RawUtxo['utxo_id']
    isConfirmed: boolean
  }
  setCollateralId(collateralId: RawUtxo['utxo_id']): Promise<void>

  // Fiat
  fetchCurrentPrice(symbol: CurrencySymbol): Promise<number>

  // Other
  subscribe: (subscription: WalletSubscription) => Unsubscribe
  subscribeOnTxHistoryUpdate(handler: () => void): () => void
  checkServerStatus(): Promise<ServerStatus>

  // CIP36 Payment Address
  getFirstPaymentAddress(): Promise<BaseAddress>

  getProtocolParams(): Promise<Api.Cardano.ProtocolParamsResult>

  // CIP-30
  getBalance(tokenId?: string): Promise<string>
  getUnusedAddresses(): Promise<string[]>
  getUsedAddresses(params?: {page: number; limit: number}): Promise<string[]>
  CIP30getChangeAddress(): Promise<string>
  CIP30getRewardAddresses(): Promise<string[]>
  CIP30getUtxos(value?: string, paginate?: {page: number; limit: number}): Promise<TransactionUnspentOutput[] | null>
  CIP30getCollateral(value?: string): Promise<TransactionUnspentOutput[] | null>
  CIP30submitTx(cbor: string): Promise<string>
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

  // NFTs
  'fetchNftModerationStatus',

  // Sync, Save
  'resync',
  'clear',
  'save',
  'sync',
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

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CardanoTypes {
  export type TxMetadata = TxMetadataType
  export type CardanoAddressedUtxo = CardanoAddressedUtxoType
  export type SignedTx = SignedTxType
  export type UnsignedTx = UnsignedTxType
  export type MultiTokenValue = MultiTokenValueType
  export type StakingKeyBalances = StakingKeyBalancesType
  export type WalletChecksum = WalletChecksumType

  export type Address = CoreTypes.Address
  export type Addressing = AddressingType
  export type AssetName = CoreTypes.AssetName
  export type BigNum = CoreTypes.BigNum
  export type Bip32PrivateKey = CoreTypes.Bip32PrivateKey
  export type Bip32PublicKey = CoreTypes.Bip32PublicKey
  export type Certificate = CoreTypes.Certificate
  export type Ed25519KeyHash = CoreTypes.Ed25519KeyHash
  export type LinearFee = CoreTypes.LinearFee
  export type MultiAsset = CoreTypes.MultiAsset
  export type PublicKey = CoreTypes.PublicKey
  export type RewardAddress = CoreTypes.RewardAddress
  export type ScriptHash = CoreTypes.ScriptHash
  export type StakeCredential = CoreTypes.Credential
  export type TransactionBuilder = CoreTypes.TransactionBuilder
  export type Value = CoreTypes.Value
  export type TokenEntry = TokenEntryType
}

export {legacyWalletChecksum, walletChecksum} from '@emurgo/cip4-js'
export {RegistrationStatus} from '@emurgo/yoroi-lib'
export {AssetOverflowError, NoOutputsError, NotEnoughMoneyToSendError} from '@emurgo/yoroi-lib/dist/errors'
