// API-related types for staking

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

