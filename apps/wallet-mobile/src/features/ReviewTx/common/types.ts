import {Balance, Portfolio} from '@yoroi/types'

export type TransactionBody = any
export type TransactionInputs = any
export type TransactionOutputs = any

export type FormattedInput = {
  assets: Array<{
    tokenInfo: Portfolio.Token.Info
    name: string
    label: string
    quantity: Balance.Quantity
    isPrimary: boolean
  }>
  address: string | undefined
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
}
