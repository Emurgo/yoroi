import {Addressing} from '@emurgo/yoroi-lib-core'

import {RawUtxo} from '../legacy/types'
import {RemoteCertificateMeta, Withdrawal} from './staking'
import {TokenEntry} from './tokens'
export type TransactionDirection = 'SENT' | 'RECEIVED' | 'SELF' | 'MULTI'
export type TransactionStatus = 'SUCCESSFUL' | 'PENDING' | 'FAILED'
export type TransactionAssurance = 'PENDING' | 'FAILED' | 'LOW' | 'MEDIUM' | 'HIGH'

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

export type AddressedUtxo = RawUtxo & Addressing

export type IOData = {
  address: string
  amount: string
  assets: Array<TokenEntry>
}
