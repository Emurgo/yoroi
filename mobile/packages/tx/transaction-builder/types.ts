import {Balance} from '@yoroi/types'

import type {Certificate} from '@emurgo/cross-csl-core'

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

export type TransactionCertificate = {
  cert: Certificate
  // Additional metadata can be added here
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
