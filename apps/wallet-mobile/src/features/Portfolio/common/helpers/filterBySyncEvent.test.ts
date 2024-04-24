import {Portfolio} from '@yoroi/types'

import {filterBySyncEvent} from './filterBySyncEvent'

describe('filterBySyncEvent', () => {
  it('should return true if the event is a sync event', () => {
    const event: Portfolio.Event.BalanceManager = {
      on: Portfolio.Event.ManagerOn.Sync,
      mode: 'all',
      sourceId: '1',
    }
    expect(filterBySyncEvent(event)).toBe(true)
  })

  it('should return false if the event is not a sync event', () => {
    const event: Portfolio.Event.BalanceManager = {
      on: Portfolio.Event.ManagerOn.Hydrate,
      sourceId: '1',
    }
    expect(filterBySyncEvent(event)).toBe(false)
  })

  it('should work with TokenManager events as well', () => {
    const event: Portfolio.Event.TokenManager = {
      on: Portfolio.Event.ManagerOn.Sync,
      ids: [],
      sourceId: '1',
    }
    expect(filterBySyncEvent(event)).toBe(true)
  })
})
