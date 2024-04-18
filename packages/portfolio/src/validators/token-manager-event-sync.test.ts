import {isEventTokenManagerSync} from './token-manager-event-sync'
import {Portfolio} from '@yoroi/types'

describe('isEventTokenManagerSync', () => {
  it('should return true for valid TokenManagerSync event', () => {
    const data: Portfolio.Event.TokenManagerSync = {
      ids: ['token.1', 'token.2'],
      on: Portfolio.Event.ManagerOn.Sync,
      sourceId: 'sourceId',
    }
    const result = isEventTokenManagerSync(data)
    expect(result).toBe(true)
  })

  it('should return false for invalid TokenManagerSync event', () => {
    const data = {
      ids: ['token1', 'token2'],
      on: Portfolio.Event.ManagerOn.Hydrate,
      sourceId: 'sourceId',
    }
    const result = isEventTokenManagerSync(data)
    expect(result).toBe(false)
  })

  it('should return false for non-object input', () => {
    expect(isEventTokenManagerSync('invalid')).toBe(false)
    expect(isEventTokenManagerSync(null)).toBe(false)
  })

  it('should return false for missing properties', () => {
    const data = {
      ids: ['token1', 'token2'],
      on: Portfolio.Event.ManagerOn.Sync,
    }
    const result = isEventTokenManagerSync(data)
    expect(result).toBe(false)
  })
})
