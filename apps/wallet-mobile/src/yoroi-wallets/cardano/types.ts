import {WalletChecksum as WalletChecksumType} from '@emurgo/cip4-js'
import * as CoreTypes from '@emurgo/cross-csl-core'
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
import {Api, App, Balance, HW, Network, Portfolio, Wallet} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'

import {WalletEncryptedStorage} from '../../kernel/storage/EncryptedStorage'
import {
  AccountStates,
  StakePoolInfoRequest,
  StakePoolInfosAndHistories,
  StakingInfo,
  StakingStatus,
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
import type {Addresses} from './account-manager/account-manager'

export type WalletEvent =
  | {type: 'initialize'}
  | {type: 'transactions'; transactions: Record<string, TransactionInfo>}
  | {type: 'addresses'; addresses: Addresses}
  | {type: 'state'; state: WalletState}
  | {type: 'utxos'; utxos: RawUtxo[]}
  | {type: 'collateral-id'; collateralId: RawUtxo['utxo_id']}

export type WalletSubscription = (event: WalletEvent) => void
export type Unsubscribe = () => void

export type ServerStatus = {
  isServerOk: boolean
  isMaintenance: boolean
  serverTime: number | undefined
  isQueueOnline?: boolean
}

export type Pagination = {
  page: number
  limit: number
}

export interface YoroiWallet {
  id: string
  publicKeyHex: string
  primaryToken: Readonly<DefaultAsset>
  primaryTokenInfo: Readonly<Balance.TokenInfo>
  readonly portfolioPrimaryTokenInfo: Readonly<Portfolio.Token.Info>

  // ---------------------------------------------------------------------------------------
  //                     ########## Interface  -  V2 ##########
  // network
  readonly networkManager: Readonly<Network.Manager>
  readonly isMainnet: boolean

  // portfolio
  readonly balanceManager: Readonly<Portfolio.Manager.Balance>
  readonly balance$: Readonly<Portfolio.Manager.Balance['observable$']>
  get balances(): ReturnType<Portfolio.Manager.Balance['getBalances']>
  get primaryBalance(): ReturnType<Portfolio.Manager.Balance['getPrimaryBalance']>
  get primaryBreakdown(): ReturnType<Portfolio.Manager.Balance['getPrimaryBreakdown']>
  get isEmpty(): boolean
  get hasOnlyPrimary(): boolean

  // account
  readonly accountVisual: number

  // sync
  resync(): Promise<void>
  clear(): Promise<void>
  sync(params: {isForced?: boolean}): Promise<void>
  // ---------------------------------------------------------------------------------------

  // API
  api: App.Api

  signRawTx(txHex: string, pKeys: CoreTypes.PrivateKey[]): Promise<Uint8Array | undefined>

  // Sending
  createUnsignedTx(params: {
    entries: YoroiEntry[]
    metadata?: Array<CardanoTypes.TxMetadata>
    addressMode: Wallet.AddressMode
  }): Promise<YoroiUnsignedTx>
  signTx(signRequest: YoroiUnsignedTx, rootKey: string): Promise<YoroiSignedTx>
  submitTransaction(signedTx: string): Promise<void>

  // Ledger
  signTxWithLedger(request: YoroiUnsignedTx, useUSB: boolean, hwDeviceInfo: HW.DeviceInfo): Promise<YoroiSignedTx>
  ledgerSupportsCIP36(useUSB: boolean, hwDeviceInfo: HW.DeviceInfo): Promise<boolean>
  signSwapCancellationWithLedger(cbor: string, useUSB: boolean, hwDeviceInfo: HW.DeviceInfo): Promise<void>

  // Voting
  createVotingRegTx(params: {
    pin: string
    supportsCIP36: boolean
    addressMode: Wallet.AddressMode
  }): Promise<{votingRegTx: YoroiUnsignedTx; votingKeyEncrypted: string}>
  fetchFundInfo(): Promise<FundInfoResponse>

  // Staking
  rewardAddressHex: string
  createDelegationTx(params: {
    poolId: string
    delegatedAmount: BigNumber
    addressMode: Wallet.AddressMode
  }): Promise<YoroiUnsignedTx>
  createWithdrawalTx(params: {shouldDeregister: boolean; addressMode: Wallet.AddressMode}): Promise<YoroiUnsignedTx>
  getDelegationStatus(): StakingStatus
  getAllUtxosForKey(): Promise<Array<CardanoTypes.CardanoAddressedUtxo>>
  getStakingInfo: () => Promise<StakingInfo>
  fetchAccountState(): Promise<AccountStates>
  fetchPoolInfo(request: StakePoolInfoRequest): Promise<StakePoolInfosAndHistories>
  getStakingKey: () => Promise<CardanoTypes.PublicKey>
  createUnsignedGovernanceTx(params: {
    addressMode: Wallet.AddressMode
    votingCertificates: CardanoTypes.Certificate[]
  }): Promise<YoroiUnsignedTx>

  // Password
  encryptedStorage: WalletEncryptedStorage

  // Account -> Addresses
  get externalAddresses(): Addresses
  get internalAddresses(): Addresses
  get isUsedAddressIndex(): Record<string, boolean>
  get numReceiveAddresses(): number
  get receiveAddresses(): Addresses
  canGenerateNewReceiveAddress(): boolean
  generateNewReceiveAddress(): boolean
  generateNewReceiveAddressIfNeeded(): boolean
  getChangeAddress(addressMode: Wallet.AddressMode): string

  // NFTs
  fetchNftModerationStatus(fingerprint: string): Promise<YoroiNftModerationStatus>

  // Balances, TxDetails
  saveMemo(txId: string, memo: string): Promise<void>
  get transactions(): Record<string, TransactionInfo>
  get confirmationCounts(): Record<string, null | number>
  fetchTipStatus(): Promise<TipStatusResponse>
  fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse>
  fetchTokenInfo(tokenId: string): Promise<Balance.TokenInfo>

  // Utxos
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
  getFirstPaymentAddress(): Promise<CoreTypes.BaseAddress>

  getProtocolParams(): Promise<Api.Cardano.ProtocolParamsResult>
}

export const isYoroiWallet = (wallet: unknown): wallet is YoroiWallet => {
  return !!wallet && typeof wallet === 'object' && yoroiWalletKeys.every((key) => key in wallet)
}

const yoroiWalletKeys: Array<keyof YoroiWallet> = [
  'id',
  'publicKeyHex',
  'primaryToken',
  'primaryTokenInfo',

  // Portfolio
  'balance$',
  'balances',
  'primaryBalance',
  'primaryBreakdown',

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

export {RegistrationStatus} from '@emurgo/yoroi-lib'
export {AssetOverflowError, NoOutputsError, NotEnoughMoneyToSendError} from '@emurgo/yoroi-lib/dist/errors'
