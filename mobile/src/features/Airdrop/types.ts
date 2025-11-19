// Note: redeem.prod.gd.midnighttge.io may not be deployed yet
// If DNS resolution fails, the API calls will handle it gracefully
export const REDEMPTION_API_BASE_URL = 'https://redeem.prod.gd.midnighttge.io'

export type ThawStatus =
  | 'upcoming'
  | 'queued'
  | 'redeemable'
  | 'submitted'
  | 'failed'
  | 'confirming'
  | 'confirmed'
  | 'skipped'

export type TransactionStatus =
  | 'queued'
  | 'submitted'
  | 'failed'
  | 'confirming'
  | 'confirmed'

export interface PhaseConfigResponse {
  genesis_timestamp: number
  jitter_strata_count: number
  redemption_increment_period: number
  redemption_increments: number
  redemption_initial_delay: number
}

export interface Thaw {
  amount: number
  queue_position?: number
  status: ThawStatus
  thawing_period_start: string
  transaction_id?: string
}

export interface ThawScheduleResponse {
  number_of_claimed_allocations: number
  thaws: Thaw[]
}

export interface BuildTransactionRequest {
  change_address: string
  collateral_utxos: string[]
  funding_utxos: string[]
}

export interface BuildTransactionResponse {
  redeemed_amount: number
  require_thawing_extra_signature: boolean
  transaction: string
  transaction_id: string
}

export interface ThawTransactionRequest {
  transaction: string
  transaction_witness_set: string
}

export interface ThawTransactionResponse {
  estimated_submission_time: number
  transaction_id: string
}

export interface GetTransactionResponse {
  redeemed_amount: number
  status: TransactionStatus
  transaction_id: string
}

export interface AddressAllocation {
  address: string
  schedule: ThawScheduleResponse
  redeemableAmount: number
  totalAllocation: number
  redeemedSoFar: number
  totalLeftToRedeem: number
}
