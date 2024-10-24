import {
  CertificateJSON,
  TransactionBodyJSON,
  TransactionInputsJSON,
  TransactionOutputsJSON,
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
  certificates: FormattedCertificate[] | null
}

export type FormattedMetadata = {
  hash: string | null
  metadata: {msg: Array<unknown>} | null
}

type AssertEqual<T, Expected> = T extends Expected
  ? Expected extends T
    ? true
    : ['Type', Expected, 'is not equal to', T]
  : ['Type', T, 'is not equal to', Expected]

type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never

type Transformed<T> = {
  [K in keyof UnionToIntersection<T>]: {type: K; value: UnionToIntersection<T>[K]}
}[keyof UnionToIntersection<T>]

export type FormattedCertificate = Transformed<CertificateJSON>

export const CertificateType = {
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
  StakeAndVoteDelegation: 'StakeAndVoteDelegation',
  StakeRegistrationAndDelegation: 'StakeRegistrationAndDelegation',
  StakeVoteRegistrationAndDelegation: 'StakeVoteRegistrationAndDelegation',
  VoteDelegation: 'VoteDelegation',
  VoteRegistrationAndDelegation: 'VoteRegistrationAndDelegation',
} as const

export type CerificateType = (typeof CertificateType)[keyof typeof CertificateType]

// Makes sure CertificateType lists all the certificates in CertificateJSON
export type AssertAllImplementedCertTypes = AssertEqual<CerificateType, keyof UnionToIntersection<CertificateJSON>>
