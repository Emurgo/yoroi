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
import {Api, App, HW, Network, Portfolio, Wallet} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'

import {WalletEncryptedStorage} from '../../kernel/storage/EncryptedStorage'
import type {
  FundInfoResponse,
  RawUtxo,
  TransactionInfo,
  TxStatusRequest,
  TxStatusResponse,
  WalletState,
} from '../types/other'
import {
  AccountStates,
  StakePoolInfoRequest,
  StakePoolInfosAndHistories,
  StakingInfo,
  StakingStatus,
} from '../types/staking'
import {YoroiEntry, YoroiSignedTx, YoroiUnsignedTx} from '../types/yoroi'
import type {Addresses} from './account-manager/account-manager'

export type WalletEvent =
  | {type: 'initialize'}
  | {type: 'transactions'; transactions: Record<string, TransactionInfo>}
  | {type: 'addresses'; addresses: Addresses}
  | {type: 'state'; state: WalletState}
  | {type: 'utxos'; utxos: RawUtxo[]}
  | {type: 'collateral-id'; collateralId: RawUtxo['utxo_id']}

export type WalletSubscription = (event: WalletEvent) => void
type Unsubscribe = () => void

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
  protocolParams: Api.Cardano.ProtocolParams
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

  get receiveAddressInfo(): Readonly<{
    lastUsedIndexVisual: number
    lastUsedIndex: number
    canIncrease: boolean
  }>

  // API
  api: App.Api

  signRawTx(txHex: string, pKeys: CoreTypes.PrivateKey[]): Promise<Uint8Array | undefined>

  getAddressing(address: string): {path: number[]; startLevel: number}

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
  ledgerSupportsCIP1694(useUSB: boolean, hwDeviceInfo: HW.DeviceInfo): Promise<boolean>
  signSwapCancellationWithLedger(cbor: string, useUSB: boolean, hwDeviceInfo: HW.DeviceInfo): Promise<void>

  // Voting
  createVotingRegTx(params: {
    supportsCIP36: boolean
    addressMode: Wallet.AddressMode
    catalystKeyHex: string
  }): Promise<{votingRegTx: YoroiUnsignedTx}>
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
  get receiveAddresses(): Addresses
  generateNewReceiveAddress(): boolean
  getChangeAddress(addressMode: Wallet.AddressMode): string

  // Balances, TxDetails
  saveMemo(txId: string, memo: string): Promise<void>
  get transactions(): Record<string, TransactionInfo>
  get confirmationCounts(): Record<string, null | number>
  fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse>

  // Utxos
  utxos: Array<RawUtxo>
  allUtxos: Array<RawUtxo>
  get collateralId(): string
  getCollateralInfo(): {
    utxo: RawUtxo | undefined
    amount: Portfolio.Token.Amount
    collateralId: RawUtxo['utxo_id']
    isConfirmed: boolean
  }
  setCollateralId(collateralId: RawUtxo['utxo_id']): Promise<void>

  // Other
  subscribe: (subscription: WalletSubscription) => Unsubscribe
  subscribeOnTxHistoryUpdate(handler: () => void): () => void
  checkServerStatus(): Promise<ServerStatus>

  // CIP36 Payment Address
  getFirstPaymentAddress(): Promise<CoreTypes.BaseAddress>
}

export const isYoroiWallet = (wallet: unknown): wallet is YoroiWallet => {
  return !!wallet && typeof wallet === 'object' && yoroiWalletKeys.every((key) => key in wallet)
}

const yoroiWalletKeys: Array<keyof YoroiWallet> = [
  'id',
  'publicKeyHex',

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
  'receiveAddresses',
  'generateNewReceiveAddress',

  // Sync, Save
  'resync',
  'clear',
  'sync',
  'saveMemo',

  // Balances, TxDetails
  'transactions',
  'confirmationCounts',
  'fetchTxStatus',

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
export {NoOutputsError, NotEnoughMoneyToSendError} from '@emurgo/yoroi-lib/dist/errors'
