import {
  CertificatesJSON,
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
  certificates: Certificates
}

export type FormattedMetadata = {
  hash: string | null
  metadata: {msg: Array<unknown>} | null
}

export type Certificates = CertificatesJSON | null
