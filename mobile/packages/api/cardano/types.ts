import {StakePoolInfoRequest, StakePoolInfosAndHistories} from '@yoroi/staking'
import {
  Address,
  KeyHash,
  PublicKeyHex,
  TransactionCbor,
  WalletTransaction,
} from '@yoroi/types'

import {
  AccountStateRequest,
  AccountStateResponse,
  TipStatusResponse,
  TxHistoryRequest,
  TxStatusRequest,
  TxStatusResponse,
} from './api-types'

export type CardanoBackend = 'backend-zero' | 'legacy'

export type WalletContext = {
  walletId: string
  publicKeyHex?: PublicKeyHex
  accountPubKeyHex?: PublicKeyHex
  paymentKeyHashes: KeyHash[]
  rewardAddresses: Address[]
}

export type EndpointPreference = {
  getTipStatus: CardanoBackend
  fetchNewTxHistory: CardanoBackend
  filterUsedAddresses: CardanoBackend
  submitTransaction: CardanoBackend
  getAccountState: CardanoBackend
  bulkGetAccountState: CardanoBackend
  getPoolInfo: CardanoBackend
  fetchTxStatus: CardanoBackend
  checkServerStatus: CardanoBackend
  getFundInfo: CardanoBackend
}

export type Addresses = Array<Address>

export interface CardanoApiAdapter {
  getTipStatus(): Promise<TipStatusResponse>

  fetchNewTxHistory(
    request: TxHistoryRequest,
    walletContext?: WalletContext,
  ): Promise<{isLast: boolean; transactions: Array<WalletTransaction>}>

  filterUsedAddresses(
    addresses: Addresses,
    walletContext?: WalletContext,
  ): Promise<Addresses>

  submitTransaction(signedTx: TransactionCbor): Promise<void>

  getAccountState(
    request: AccountStateRequest,
    walletContext?: WalletContext,
  ): Promise<AccountStateResponse>

  bulkGetAccountState(
    addresses: Addresses,
    walletContext?: WalletContext,
  ): Promise<AccountStateResponse>

  getPoolInfo(
    request: StakePoolInfoRequest,
  ): Promise<StakePoolInfosAndHistories>

  fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse>

  checkServerStatus?(): Promise<{
    isServerOk: boolean
    serverTime: number
  }>

  getFundInfo?(): Promise<{
    currentFund: {
      id: number
      registrationStart: string
      registrationEnd: string
      votingStart?: string
      votingEnd?: string
      votingPowerThreshold: string
    } | null
    nextFund: {
      id: number
      registrationStart: string
      registrationEnd: string
      votingStart?: string
      votingEnd?: string
      votingPowerThreshold: string
    } | null
  }>
}

export type CardanoApiMaker = (config: {
  baseApiUrl: string
  backendZeroUrl: string
}) => CardanoApiAdapter

export interface ManagedCardanoApi {
  getTipStatus(): Promise<TipStatusResponse>

  fetchNewTxHistory(
    request: TxHistoryRequest,
    walletContext?: WalletContext,
  ): Promise<{isLast: boolean; transactions: Array<WalletTransaction>}>

  filterUsedAddresses(
    addresses: Addresses,
    walletContext?: WalletContext,
  ): Promise<Addresses>

  submitTransaction(signedTx: TransactionCbor): Promise<void>

  getAccountState(
    request: AccountStateRequest,
    walletContext?: WalletContext,
  ): Promise<AccountStateResponse>

  bulkGetAccountState(
    addresses: Addresses,
    walletContext?: WalletContext,
  ): Promise<AccountStateResponse>

  getPoolInfo(
    request: StakePoolInfoRequest,
  ): Promise<StakePoolInfosAndHistories>

  fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse>

  checkServerStatus?(): Promise<{
    isServerOk: boolean
    serverTime: number
  }>

  getFundInfo?(): Promise<{
    currentFund: {
      id: number
      registrationStart: string
      registrationEnd: string
      votingStart?: string
      votingEnd?: string
      votingPowerThreshold: string
    } | null
    nextFund: {
      id: number
      registrationStart: string
      registrationEnd: string
      votingStart?: string
      votingEnd?: string
      votingPowerThreshold: string
    } | null
  }>
}
