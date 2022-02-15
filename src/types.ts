import {WalletChecksum} from '@emurgo/cip4-js'
import type {IntlShape} from 'react-intl'

import {AccountStates, AddressedUtxo, RawUtxo} from './types/cardano'

export interface WalletInterface {
  id: string
  walletImplementationId: string
  networkId: number
  provider?: YoroiProvider
  checksum: WalletChecksum
  isReadOnly: boolean
  isHW: boolean
  isEasyConfirmationEnabled: boolean
  rewardAddressHex: string
  changePassword(masterPassword: string, newPassword: string, intl: IntlShape): Promise<void>
  fetchPoolInfo(request: StakePoolInfoRequest): Promise<StakePoolInfosAndHistories>
  getDelegationStatus(): Promise<StakingStatus>
  getAllUtxosForKey(utxos: Array<RawUtxo>): Promise<Array<AddressedUtxo>>
  fetchAccountState(): Promise<AccountStates>
  fetchUTXOs(): Promise<Array<RawUtxo>>
  fetchTokenInfo(request: {tokenIds: Array<string>}): Promise<Record<string, TokenMetadata | null>>
  subscribe(handler: (wallet: WalletInterface) => void): void
  subscribeOnTxHistoryUpdate(handler: () => void): void
}

export type TokenMetadata = {
  name: string
  decimals?: number
  assetName: string
  policyId: string
  longName?: string
  ticker?: string
}

// https://github.com/cardano-foundation/cardano-token-registry#semantic-content-of-registry-entries
export type TokenRegistryEntry = {
  subject: string
  name: string
  description: string
  policy?: string
  ticker?: string
  url?: string
  logo?: string
  decimals?: number
}

export type StakingStatus = Registered | NotRegistered
type Registered = {
  isRegistered: true
  poolKeyHash: string
}
type NotRegistered = {
  isRegistered: false
  poolKeyHash: null
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

export type Device = {
  id: number
  name: string
}

export type YoroiProvider = '' | 'emurgo-alonzo'

// STAKING
export type StakePoolInfoRequest = {
  poolIds: Array<string>
}

export type StakePoolInfosAndHistories = {
  [key: string]: StakePoolInfoAndHistory | RemotePoolMetaFailure
}

export type StakePoolInfo = {
  name?: string
  ticker?: string
  description?: string
  homepage?: string
  // other stuff from SMASH.
}

type StakePoolHistory = Array<{
  epoch: number
  slot: number
  tx_ordinal: number
  cert_ordinal: number
  payload: RemoteCertificate
}>

export type StakePoolInfoAndHistory = {
  info: StakePoolInfo
  history: StakePoolHistory
}

export type RemotePoolMetaFailure = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any
}

export type RemoteCertificate = {
  kind: 'PoolRegistration' | 'PoolRetirement'
  certIndex: number
  poolParams: Record<string, unknown> // don't think this is relevant
}
