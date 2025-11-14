import {Balance} from '@yoroi/types'

import {Datum} from '../types'
import {ModernUtxo} from '../utxo/models'

export type TransactionOutput = {
  address: string
  amounts: Balance.Amounts
  datum?: Datum
}

export type TransactionInput = {
  utxo: ModernUtxo
}

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
 * DRep value type - matches DRepValue from @yoroi/staking
 */
export type DRepValue =
  | 'AlwaysAbstain'
  | 'AlwaysNoConfidence'
  | {KeyHash: string}
  | {ScriptHash: string}

/**
 * Certificate data for transaction building
 * Based on RemoteCertificateMeta from @yoroi/staking but adapted for transaction builder:
 * - Uses stakeCredentialKeyHashHex instead of rewardAddress (extracted from address)
 * - Uses 'kind' field to match RemoteCertificateMeta pattern
 * - Stores only the data needed to recreate CSL Certificate objects
 */
export type TransactionCertificate =
  | {
      kind: 'StakeRegistration'
      stakeCredentialKeyHashHex: string
    }
  | {
      kind: 'StakeDeregistration'
      stakeCredentialKeyHashHex: string
    }
  | {
      kind: 'StakeDelegation'
      stakeCredentialKeyHashHex: string
      poolKeyHash: string // hex
    }
  | {
      kind: 'PoolRegistration'
      poolParams: Record<string, unknown>
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
  | {
      kind: 'GenesisKeyDelegation'
      stakeCredentialKeyHashHex?: string
    }
  | {
      kind: 'CommitteeHotAuth'
      stakeCredentialKeyHashHex?: string
    }
  | {
      kind: 'CommitteeColdResign'
      stakeCredentialKeyHashHex?: string
    }
  | {
      kind: 'DRepDeregistration'
      stakeCredentialKeyHashHex?: string
    }
  | {
      kind: 'DRepRegistration'
      stakeCredentialKeyHashHex?: string
    }
  | {
      kind: 'DRepUpdate'
      stakeCredentialKeyHashHex?: string
    }
  | {
      kind: 'VoteDelegation'
      stakeCredentialKeyHashHex: string
      drep: DRepValue
    }
  | {
      kind: 'StakeAndVoteDelegation'
      stakeCredentialKeyHashHex: string
      poolKeyHash?: string // hex
      drep?: DRepValue | null
    }
  | {
      kind: 'StakeRegistrationAndDelegation'
      stakeCredentialKeyHashHex: string
      poolKeyHash?: string // hex
    }
  | {
      kind: 'StakeVoteRegistrationAndDelegation'
      stakeCredentialKeyHashHex: string
      poolKeyHash?: string // hex
      drep?: DRepValue | null
    }
  | {
      kind: 'VoteRegistrationAndDelegation'
      stakeCredentialKeyHashHex: string
      drep?: DRepValue | null
    }

export type TransactionWithdrawal = {
  rewardAddress: string
  amount: string
}

export type TransactionReferenceInput = {
  utxo: ModernUtxo
}

export type TransactionMetadata = {
  label: string
  data: any
}

export type TransactionOptions = {
  changeAddress?: string
  ttl?: number
  validityInterval?: {
    start: number
    end: number
  }
  metadata?: TransactionMetadata[]
  manualChangeOutput?: TransactionOutput
  manualFee?: Balance.Amounts
}

export type UnsignedTransaction = {
  inputs: TransactionInput[]
  outputs: TransactionOutput[]
  certificates: TransactionCertificate[]
  withdrawals: TransactionWithdrawal[]
  referenceInputs: TransactionReferenceInput[]
  collateralInputs: TransactionInput[]
  metadata?: TransactionMetadata[]
  options: TransactionOptions
  cbor?: string // CBOR hex string
}
