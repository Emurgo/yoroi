// Production API endpoint for Midnight TGE redemption
// Previous API URLs:
// - 'https://sm.midnight.gd' (Phase 2 - Scavenger Mine, ended)
// - 'https://redeem.prod.gd.midnighttge.io' (deprecated, no longer exists)
// - 'https://preprod.gd.midnighttge.io' (preprod environment, deprecated)
// Production endpoint: 'https://redeem.midnight.gd' (Phase 3 - requires SSO auth)
// If DNS resolution fails, the API calls will handle it gracefully
export const REDEMPTION_API_BASE_URL = 'https://mainnet.prod.gd.midnighttge.io'

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
  redemption_initial_delay?: number // Optional, not always returned by API
}

export interface Thaw {
  amount: number
  queue_position?: number
  status: ThawStatus
  thawing_period_start: string
  transaction_id?: string
}

export interface ThawScheduleResponse {
  numberOfClaimedAllocations: number
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
