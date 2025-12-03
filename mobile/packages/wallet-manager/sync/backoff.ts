import {SyncConfig} from './sync-config'

/**
 * Calculate exponential backoff delay
 */
export const calculateBackoffDelay = (
  errorCount: number,
  config: SyncConfig,
): number => {
  const delay = Math.min(
    config.fastInterval * Math.pow(config.backoffMultiplier, errorCount),
    config.maxBackoffDelay,
  )
  return delay
}

/**
 * Check if wallet should retry sync based on backoff
 */
export const shouldRetrySync = (
  errorCount: number,
  lastRetryTime: number | undefined,
  config: SyncConfig,
): boolean => {
  if (errorCount === 0) {
    return true
  }

  if (errorCount >= config.maxRetries) {
    return false
  }

  if (!lastRetryTime) {
    return true
  }

  const backoffDelay = calculateBackoffDelay(errorCount, config)
  const timeSinceLastRetry = Date.now() - lastRetryTime

  return timeSinceLastRetry >= backoffDelay
}

/**
 * Get next retry time based on backoff
 */
export const getNextRetryTime = (
  errorCount: number,
  config: SyncConfig,
): number => {
  const backoffDelay = calculateBackoffDelay(errorCount, config)
  return Date.now() + backoffDelay
}
