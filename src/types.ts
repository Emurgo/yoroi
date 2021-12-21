import {WalletChecksum} from '@emurgo/cip4-js'
import type {IntlShape} from 'react-intl'

export interface WalletInterface {
  id: string
  walletImplementationId: string
  networkId: number
  provider?: YoroiProvider
  checksum: WalletChecksum
  isReadOnly: boolean
  isHW: boolean
  isEasyConfirmationEnabled: boolean
  changePassword(masterPassword: string, newPassword: string, intl: IntlShape): Promise<void>
  fetchPoolInfo(request: PoolInfoRequest): Promise<PoolInfoResponse>
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
export type PoolInfoRequest = {
  poolIds: Array<string>
}

export type PoolInfoResponse = {
  [key: string]: RemotePoolMetaSuccess | RemotePoolMetaFailure
}

export type RemotePoolMetaSuccess = {
  info: {
    name?: string
    ticker?: string
    description?: string
    homepage?: string
    // other stuff from SMASH.
  }
  history: Array<{
    epoch: number
    slot: number
    tx_ordinal: number
    cert_ordinal: number
    payload: RemoteCertificate
  }>
}

export type RemotePoolMetaFailure = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any
}

export type RemoteCertificateMeta =
  | {kind: 'StakeRegistration'; rewardAddress: string /* hex */}
  | {kind: 'StakeDeregistration'; rewardAddress: string /* hex */}
  | {kind: 'StakeDelegation'; rewardAddress: string /* hex */; poolKeyHash: string /* hex */}
  | {kind: 'PoolRegistration'; poolParams: Record<string, unknown> /* we don't care about this for now */}
  | {kind: 'PoolRetirement'; poolKeyHash: string /* hex */}
  | {kind: 'MoveInstantaneousRewardsCert'; rewards: {[addresses: string]: string}; pot: 0 | 1}

export type RemoteCertificate = {
  kind: 'PoolRegistration' | 'PoolRetirement'
  certIndex: number
  poolParams: Record<string, unknown> // don't think this is relevant
}
