import {WalletChecksum} from '@emurgo/cip4-js'
import type {IntlShape} from 'react-intl'

import {StoreService} from '../store'
import {AccountStates, StakePoolInfoRequest, StakePoolInfosAndHistories, StakingStatus} from './staking'
import {MultiToken, TokenInfo} from './tokens'
import {AddressedUtxo, RawUtxo} from './transactions'

export interface WalletInterface {
  id: string
  walletImplementationId: WalletImplementationId
  networkId: NetworkId
  provider?: YoroiProvider
  checksum: WalletChecksum
  isReadOnly: boolean
  isHW: boolean
  isEasyConfirmationEnabled: boolean
  rewardAddressHex: string
  hwDeviceInfo: unknown
  transactions: unknown
  internalAddresses: unknown
  externalAddresses: unknown
  confirmationCounts: unknown
  isUsedAddressIndex: unknown
  numReceiveAddresses: number
  isInitialized: boolean
  store: StoreService
  changePassword(masterPassword: string, newPassword: string, intl: IntlShape): Promise<void>
  fetchPoolInfo(request: StakePoolInfoRequest): Promise<StakePoolInfosAndHistories>
  getDelegationStatus(): Promise<StakingStatus>
  getAllUtxosForKey(utxos: Array<RawUtxo>): Promise<Array<AddressedUtxo>>
  fetchAccountState(): Promise<AccountStates>
  fetchUTXOs(): Promise<Array<RawUtxo>>
  fetchTokenInfo(request: {tokenIds: Array<string>}): Promise<Record<string, TokenInfo | null>>
  signTx<T>(signRequest: ISignRequest<T>, decryptedKey: string): Promise<SignedTx>
  signTxWithLedger<T>(signRequest: ISignRequest<T>, connectionUSB: boolean): Promise<SignedTx>
  submitTransaction(signedTx: string): Promise<[]>
  fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse>
  subscribe(handler: (wallet: WalletInterface) => void): void
  subscribeOnTxHistoryUpdate(handler: () => void): void
  createVotingRegTx(
    utxos: Array<RawUtxo>,
    catalystPrivateKey: string,
    decryptedKey?: string,
    serverTime?: Date | null,
  ): Promise<void>
  checkServerStatus(): Promise<ServerStatus>
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
  serverTime: number | null
  isQueueOnline?: boolean
}

export type ISignRequest<T> = {
  totalInput(shift: boolean): Promise<MultiToken>
  totalOutput(shift: boolean): Promise<MultiToken>
  fee(): Promise<MultiToken>
  uniqueSenderAddresses(): Array<string>
  receivers(includeChange: boolean): Promise<Array<string>>
  isEqual(tx?: unknown): Promise<boolean>

  self(): T
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

export type TxStatusRequest = {txHashes: Array<string>}

export type TxStatusResponse = {
  depth: {[txId: string]: number}
  submissionStatus?: {[txId: string]: TxSubmissionStatus}
}

export type SignedTx = {
  id: string
  encodedTx: Uint8Array
  base64: string
}
