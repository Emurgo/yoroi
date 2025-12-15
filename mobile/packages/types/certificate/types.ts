import {KeyHash, ScriptHash} from '../branded'

/**
 * Certificate kind enum - matches CertificateType from ReviewTx
 */
export const CertificateKind = {
  StakeRegistration: 'StakeRegistration',
  StakeDeregistration: 'StakeDeregistration',
  StakeDelegation: 'StakeDelegation',
  PoolRegistration: 'PoolRegistration',
  PoolRetirement: 'PoolRetirement',
  GenesisKeyDelegation: 'GenesisKeyDelegation',
  MoveInstantaneousRewardsCert: 'MoveInstantaneousRewardsCert',
  CommitteeHotAuth: 'CommitteeHotAuth',
  CommitteeColdResign: 'CommitteeColdResign',
  DRepDeregistration: 'DRepDeregistration',
  DRepRegistration: 'DRepRegistration',
  DRepUpdate: 'DRepUpdate',
  VoteDelegation: 'VoteDelegation',
  StakeAndVoteDelegation: 'StakeAndVoteDelegation',
  StakeRegistrationAndDelegation: 'StakeRegistrationAndDelegation',
  StakeVoteRegistrationAndDelegation: 'StakeVoteRegistrationAndDelegation',
  VoteRegistrationAndDelegation: 'VoteRegistrationAndDelegation',
} as const

export type CertificateKind =
  (typeof CertificateKind)[keyof typeof CertificateKind]

/**
 * DRep value type
 */
export type DRepValue =
  | 'AlwaysAbstain'
  | 'AlwaysNoConfidence'
  | {KeyHash: KeyHash}
  | {ScriptHash: ScriptHash}
