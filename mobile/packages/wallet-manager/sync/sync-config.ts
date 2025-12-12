import {time} from '@yoroi/common'

/**
 * Sync configuration
 */
export type SyncConfig = {
  /** Normal polling interval (35 seconds) */
  normalInterval: number
  /** Fast polling interval after transaction submission (5 seconds) */
  fastInterval: number
  /** How long to use fast interval after transaction submission (2 minutes) */
  fastIntervalDuration: number
  /** Maximum number of retries on error */
  maxRetries: number
  /** Exponential backoff multiplier */
  backoffMultiplier: number
  /** Maximum backoff delay in milliseconds */
  maxBackoffDelay: number
  /** Concurrency limit for parallel sync */
  concurrencyLimit: number
  /** Whether to stagger wallet syncs across the interval */
  staggerSyncs: boolean
  /** Minimum delay between staggered syncs (milliseconds) */
  staggerDelay: number
}

/**
 * Default sync configuration
 */
export const defaultSyncConfig: SyncConfig = {
  normalInterval: time.seconds(35),
  fastInterval: time.seconds(5),
  fastIntervalDuration: time.seconds(120),
  maxRetries: 3,
  backoffMultiplier: 2,
  maxBackoffDelay: time.seconds(60),
  concurrencyLimit: 3,
  staggerSyncs: true,
  staggerDelay: time.seconds(2), // 2 seconds between each wallet sync
}
