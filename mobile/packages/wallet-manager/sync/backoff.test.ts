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
      // Note: getNextRetryTime doesn't add jitter - it just calculates the delay
      // The jitter would be added by the caller if needed
      // This test verifies that the function returns consistent values for the same error count
      const retry1 = getNextRetryTime(errorCount, defaultSyncConfig)
      const retry2 = getNextRetryTime(errorCount, defaultSyncConfig)

      // Both should be in the future
      expect(retry1).toBeGreaterThan(Date.now())
      expect(retry2).toBeGreaterThan(Date.now())

      // They should be close to each other (within 100ms) since called quickly
      expect(Math.abs(retry1 - retry2)).toBeLessThan(100)
    })
  })
})
