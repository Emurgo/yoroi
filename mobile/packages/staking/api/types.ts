// API-related types for staking
import {CertificateKind, DRepValue} from '@yoroi/types'

// Re-export DRepValue from @yoroi/types
export type {DRepValue}

export type RemoteCertificateMeta =
  | {
      kind: typeof CertificateKind.StakeRegistration
      rewardAddress: string // hex
    }
  | {
      kind: typeof CertificateKind.StakeDeregistration
      rewardAddress: string // hex
    }
  | {
      kind: typeof CertificateKind.StakeDelegation
      rewardAddress: string // hex
      poolKeyHash: string // hex
    }
  | {
      kind: typeof CertificateKind.PoolRegistration
      poolParams: Record<string, unknown>
    }
  | {
      kind: typeof CertificateKind.PoolRetirement
      poolKeyHash: string // hex
    }
  | {
      kind: typeof CertificateKind.MoveInstantaneousRewardsCert
      rewards: Record<string, string>
      pot: 0 | 1
    }
  | {
      kind: typeof CertificateKind.GenesisKeyDelegation
      rewardAddress?: string // hex
    }
  | {
      kind: typeof CertificateKind.CommitteeHotAuth
      rewardAddress?: string // hex
    }
  | {
      kind: typeof CertificateKind.CommitteeColdResign
      rewardAddress?: string // hex
    }
  | {
      kind: typeof CertificateKind.DRepDeregistration
      rewardAddress?: string // hex
    }
  | {
      kind: typeof CertificateKind.DRepRegistration
      rewardAddress?: string // hex
    }
  | {
      kind: typeof CertificateKind.DRepUpdate
      rewardAddress?: string // hex
    }
  | {
      kind: typeof CertificateKind.VoteDelegation
      rewardAddress?: string // hex
      drep?: DRepValue | null
    }
  | {
      kind: typeof CertificateKind.StakeAndVoteDelegation
      rewardAddress?: string // hex
      poolKeyHash?: string // hex
      drep?: DRepValue | null
    }
  | {
      kind: typeof CertificateKind.StakeRegistrationAndDelegation
      rewardAddress?: string // hex
      poolKeyHash?: string // hex
    }
  | {
      kind: typeof CertificateKind.StakeVoteRegistrationAndDelegation
      rewardAddress?: string // hex
      poolKeyHash?: string // hex
      drep?: DRepValue | null
    }
  | {
      kind: typeof CertificateKind.VoteRegistrationAndDelegation
      rewardAddress?: string // hex
      drep?: DRepValue | null
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
