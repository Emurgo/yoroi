import {Addressing} from '@emurgo/yoroi-lib-core'

import {RemoteCertificateMeta, Withdrawal} from './staking'
import {Token, TokenEntry, TokenEntryPlain} from './tokens'
export type TransactionDirection = 'SENT' | 'RECEIVED' | 'SELF' | 'MULTI'
export type TransactionStatus = 'SUCCESSFUL' | 'PENDING' | 'FAILED'
export type TransactionAssurance = 'PENDING' | 'FAILED' | 'LOW' | 'MEDIUM' | 'HIGH'

export type TransactionInfo = {
  id: string
  inputs: Array<IOData>
  outputs: Array<IOData>
  amount: Array<TokenEntryPlain>
  fee?: Array<TokenEntryPlain>
  delta: Array<TokenEntryPlain>
  direction: TransactionDirection
  confirmations: number
  submittedAt?: string
  lastUpdatedAt: string
  status: TransactionStatus
  assurance: TransactionAssurance
  tokens: Record<string, Token>
}

export type Era = 'byron' | 'shelley'

export type RawTransaction = {
  id: string
  type?: Era
  fee?: string
  status: TransactionStatus
  inputs: Array<IOData>
  outputs: Array<IOData>
  blockNum?: number
  blockHash?: string
  txOrdinal?: number
  submittedAt?: string
  epoch?: number
  slot?: number
  lastUpdatedAt: string
  withdrawals: Array<Withdrawal>
  certificates: Array<RemoteCertificateMeta>
  validContract?: boolean
  scriptSize?: number
  collateralInputs?: Array<IOData>
}

// UTXOs

export type {Addressing} from '@emurgo/yoroi-lib-core'

export type RemoteAsset = {
  amount: string
  assetId: string
  policyId: string
  name: string
}

export type RawUtxo = {
  amount: string
  receiver: string
  tx_hash: string
  tx_index: number
  utxo_id: string
  assets: Array<RemoteAsset>
}

export type AddressedUtxo = RawUtxo & Addressing

export type IOData = {
  address: string
  amount: string
  assets: Array<TokenEntry>
}
