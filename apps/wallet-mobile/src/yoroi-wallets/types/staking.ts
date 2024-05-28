import {Balance} from '@yoroi/types'

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

export type StakePoolInfoRequest = {
  poolIds: Array<string>
}

export type StakePoolInfosAndHistories = Record<string, StakePoolInfoAndHistory | null>

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

export type RemoteCertificate = {
  kind: 'PoolRegistration' | 'PoolRetirement'
  certIndex: number
  poolParams: Record<string, unknown> // don't think this is relevant
}

export type RemoteCertificateMeta =
  | {
      kind: 'StakeRegistration'
      rewardAddress: string // hex
    }
  | {
      kind: 'StakeDeregistration'
      rewardAddress: string // hex
    }
  | {
      kind: 'StakeDelegation'
      rewardAddress: string // hex
      poolKeyHash: string // hex
    }
  | {
      kind: 'PoolRegistration'
      poolParams: Record<string, unknown> // we don't care about this for now
    }
  | {
      kind: 'PoolRetirement'
      poolKeyHash: string // hex
    }
  | {
      kind: 'MoveInstantaneousRewardsCert'
      rewards: Record<string, string>
      pot: 0 | 1
    }

export type RemoteAccountState = {
  // poolOperator: null // not implemented yet
  remainingAmount: string // current remaining awards
  rewards: string // all the rewards every added
  withdrawals: string // all the withdrawals that have ever happened
}

export type AccountStates = {
  [key: string]: null | RemoteAccountState
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
    payload: RemoteCertificate
  }>
}
