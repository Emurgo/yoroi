import {
  CommitteeColdResignJSON,
  CommitteeHotAuthJSON,
  DRepDeregistrationJSON,
  DRepRegistrationJSON,
  DRepUpdateJSON,
  GenesisKeyDelegationJSON,
  MoveInstantaneousRewardsCertJSON,
  PoolRegistrationJSON,
  PoolRetirementJSON,
  StakeAndVoteDelegationJSON,
  StakeDelegationJSON,
  StakeDeregistrationJSON,
  StakeRegistrationAndDelegationJSON,
  StakeRegistrationJSON,
  StakeVoteRegistrationAndDelegationJSON,
  TransactionBodyJSON,
  TransactionInputsJSON,
  TransactionOutputsJSON,
  VoteDelegationJSON,
  VoteRegistrationAndDelegationJSON,
} from '@emurgo/cardano-serialization-lib-nodejs'
import {CredKind} from '@emurgo/cross-csl-core'
import {Balance, Portfolio} from '@yoroi/types'

export type TransactionBody = TransactionBodyJSON
export type TransactionInputs = TransactionInputsJSON
export type TransactionOutputs = TransactionOutputsJSON

export type FormattedInput = {
  assets: Array<{
    tokenInfo: Portfolio.Token.Info
    name: string
    label: string
    quantity: Balance.Quantity
    isPrimary: boolean
  }>
  address: string | undefined
  addressKind: CredKind | null
  rewardAddress: string | null
  ownAddress: boolean
  txIndex: number
  txHash: string
}

export type FormattedInputs = Array<FormattedInput>

export type FormattedOutput = {
  assets: Array<{
    tokenInfo: Portfolio.Token.Info
    name: string
    label: string
    quantity: Balance.Quantity
    isPrimary: boolean
  }>
  address: string
  addressKind: CredKind | null
  rewardAddress: string | null
  ownAddress: boolean
}

export type FormattedOutputs = Array<FormattedOutput>

export type FormattedFee = {
  tokenInfo: Portfolio.Token.Info
  name: string
  label: string
  quantity: Balance.Quantity
  isPrimary: boolean
}

export type FormattedTx = {
  inputs: FormattedInputs
  outputs: FormattedOutputs
  fee: FormattedFee
  certificates: FormattedCertificates | null
}

export type FormattedMetadata = {
  hash: string | null
  metadata: {msg: Array<unknown>} | null
}

export type Certificates = Array<Certificate>
export type FormattedCertificates = Array<[CertificateTypes, Certificate[CertificateTypes]]>

export type Certificate = {
  StakeRegistration: StakeRegistrationJSON
  StakeDeregistration: StakeDeregistrationJSON
  StakeDelegation: StakeDelegationJSON
  PoolRegistration: PoolRegistrationJSON
  PoolRetirement: PoolRetirementJSON
  GenesisKeyDelegation: GenesisKeyDelegationJSON
  MoveInstantaneousRewardsCert: MoveInstantaneousRewardsCertJSON
  CommitteeHotAuth: CommitteeHotAuthJSON
  CommitteeColdResign: CommitteeColdResignJSON
  DRepDeregistration: DRepDeregistrationJSON
  DRepRegistration: DRepRegistrationJSON
  DRepUpdate: DRepUpdateJSON
  StakeAndVoteDelegation: StakeAndVoteDelegationJSON
  StakeRegistrationAndDelegation: StakeRegistrationAndDelegationJSON
  StakeVoteRegistrationAndDelegation: StakeVoteRegistrationAndDelegationJSON
  VoteDelegation: VoteDelegationJSON
  VoteRegistrationAndDelegation: VoteRegistrationAndDelegationJSON
}

export enum CertificateTypes {
  StakeRegistration = 'StakeRegistration',
  StakeDeregistration = 'StakeDeregistration',
  StakeDelegation = 'StakeDelegation',
  PoolRegistration = 'PoolRegistration',
  PoolRetirement = 'PoolRetirement',
  GenesisKeyDelegation = 'GenesisKeyDelegation',
  MoveInstantaneousRewardsCert = 'MoveInstantaneousRewardsCert',
  CommitteeHotAuth = 'CommitteeHotAuth',
  CommitteeColdResign = 'CommitteeColdResign',
  DRepDeregistration = 'DRepDeregistration',
  DRepRegistration = 'DRepRegistration',
  DRepUpdate = 'DRepUpdate',
  StakeAndVoteDelegation = 'StakeAndVoteDelegation',
  StakeRegistrationAndDelegation = 'StakeRegistrationAndDelegation',
  StakeVoteRegistrationAndDelegation = 'StakeVoteRegistrationAndDelegation',
  VoteDelegation = 'VoteDelegation',
  VoteRegistrationAndDelegation = 'VoteRegistrationAndDelegation',
}
