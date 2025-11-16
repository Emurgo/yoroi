import {
  CertificateKind,
  type ChainValidationResult,
  type DecodedDatum,
  type Proposal,
  type ReferenceScript,
  type Vote,
} from '@yoroi/tx'
import {Balance, Portfolio} from '@yoroi/types'

import {
  CertificateJSON,
  TransactionBodyJSON,
  TransactionInputsJSON,
  TransactionOutputsJSON,
} from '@emurgo/cardano-serialization-lib-nodejs'
import {CredKind} from '@emurgo/cross-csl-core'

export type TransactionBody = TransactionBodyJSON
export type TransactionInputs = TransactionInputsJSON
export type TransactionOutputs = TransactionOutputsJSON

export type FormattedInput = {
  assets: Array<{
    tokenInfo: Portfolio.Token.Info
    quantity: Balance.Quantity
  }>
  address: string | undefined
  addressKind: CredKind | null
  rewardAddress: string | null
  ownAddress: boolean | null
  txIndex: number
  txHash: string
  resolvedName?: string | null // Resolved alias (AdaHandle, CNS, etc.)
  contractInfo?: {
    name?: string
    purpose?: string
    description?: string
  } | null // Smart contract information
  referenceScript?: ReferenceScript | null // Reference script if present
}

export type FormattedInputs = Array<FormattedInput>

export type FormattedOutput = {
  assets: Array<{
    tokenInfo: Portfolio.Token.Info
    quantity: Balance.Quantity
  }>
  address: string
  addressKind: CredKind | null
  rewardAddress: string | null
  ownAddress: boolean
  resolvedName?: string | null // Resolved alias (AdaHandle, CNS, etc.)
  contractInfo?: {
    name?: string
    purpose?: string
    description?: string
  } | null // Smart contract information
  datum?: {
    type: 'hash' | 'inline' | 'embedded'
    hash: string
    data?: string // PlutusData hex (if available)
    decoded?: DecodedDatum | null // Decoded datum for display
    json?: unknown | null // JSON representation if available
  } | null // Datum information
  referenceScript?: ReferenceScript | null // Reference script if present
}

export type FormattedOutputs = Array<FormattedOutput>

export type FormattedFee = {
  tokenInfo: Portfolio.Token.Info
  quantity: Balance.Quantity
}

export type FormattedTx = {
  inputs: FormattedInputs
  outputs: FormattedOutputs
  fee: FormattedFee
  certificates: FormattedCertificate[] | null
  mint: Array<[Portfolio.Token.Info, string]> | null
  referenceInputs: FormattedInputs
  governance?: {
    proposals: Proposal[]
    votes: Vote[]
  } | null // Governance actions (proposals and votes)
  chainInfo?: {
    isChained: boolean
    chainOrder?: number
    validationResult?: ChainValidationResult
  } | null // Transaction chaining information
}

export type FormattedMetadata = {
  hash: string | null
  metadata: {msg: Array<string>} | null
}

type AssertEqual<T, Expected> = T extends Expected
  ? Expected extends T
    ? true
    : ['Type', Expected, 'is not equal to', T]
  : ['Type', T, 'is not equal to', Expected]

type UnionToIntersection<U> = (
  U extends unknown ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never

type Transformed<T> = {
  [K in keyof UnionToIntersection<T>]: {
    type: K
    value: UnionToIntersection<T>[K]
  }
}[keyof UnionToIntersection<T>]

// Minimal certificate with just type (for historical transactions)
type MinimalCertificate = {
  type: CertificateType
  value: Partial<Record<string, unknown>>
}

// FormattedCertificate can be either a full certificate or a minimal one
export type FormattedCertificate =
  | Transformed<CertificateJSON>
  | MinimalCertificate

// Re-export CertificateKind from @yoroi/tx as CertificateType for backward compatibility
export const CertificateType = CertificateKind
export type CertificateType = CertificateKind

// Makes sure CertificateType lists all the certificates in CertificateJSON
export type AssertAllImplementedCertTypes = AssertEqual<
  CertificateType,
  keyof UnionToIntersection<CertificateJSON>
>
