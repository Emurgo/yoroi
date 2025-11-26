import type {RemoteCertificateMeta} from '@yoroi/staking'
import {Balance} from '@yoroi/types'

// App-specific staking types (UI state)
export type StakingInfo =
  | {status: 'not-registered'}
  | {status: 'registered'}
  | {
      status: 'staked'
      poolId: string
      amount: Balance.Quantity
      rewards: Balance.Quantity
    }

export type StakingStatus =
  | {isRegistered: false}
  | {isRegistered: true}
  | {
      isRegistered: true
      poolKeyHash: string
    }

export type RemotePoolMetaSuccess = {
  info: null | {
    name?: string | null
    ticker?: string | null
    description?: string | null
    homepage?: string | null
    // other stuff from SMASH.
  }
  history: Array<{
    epoch: number
    slot: number
    tx_ordinal: number
    cert_ordinal: number
    payload: RemoteCertificateMeta
  }>
}
