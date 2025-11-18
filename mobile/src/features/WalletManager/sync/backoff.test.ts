import {getNextRetryTime} from './backoff'
import {defaultSyncConfig} from './sync-config'

describe('backoff', () => {
  describe('getNextRetryTime', () => {
    it('should calculate exponential backoff with jitter', () => {
      const now = Date.now()
      const errorCount = 3
      const nextRetryTime = getNextRetryTime(errorCount, defaultSyncConfig)

      // Should be in the future
      expect(nextRetryTime).toBeGreaterThan(now)

      // Should have exponential delay
      const delay = nextRetryTime - now
      const expectedDelay =
        defaultSyncConfig.fastInterval *
        Math.pow(defaultSyncConfig.backoffMultiplier, errorCount)
      const expectedMaxDelay = Math.min(
        expectedDelay,
        defaultSyncConfig.maxBackoffDelay,
      )

      expect(delay).toBeGreaterThanOrEqual(expectedDelay)
      expect(delay).toBeLessThanOrEqual(expectedMaxDelay)
    })

    it('should increase delay with more errors', () => {
      const now = Date.now()
      const retry1 = getNextRetryTime(1, defaultSyncConfig) - now
      const retry2 = getNextRetryTime(2, defaultSyncConfig) - now
      const retry3 = getNextRetryTime(3, defaultSyncConfig) - now

      expect(retry2).toBeGreaterThan(retry1)
      expect(retry3).toBeGreaterThan(retry2)
    })

    it('should include jitter to prevent thundering herd', () => {
      const errorCount = 2
      const retries = Array.from({length: 10}, () =>
        getNextRetryTime(errorCount, defaultSyncConfig),
      )

      // All retries should be different due to jitter
      const uniqueRetries = new Set(retries)
      expect(uniqueRetries.size).toBeGreaterThan(1)
    })
  })
})
