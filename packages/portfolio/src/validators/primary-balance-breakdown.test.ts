import {
  isPrimaryBalanceBreakdown,
  parsePrimaryBalanceBreakdown,
} from './primary-balance-breakdown'
import {tokenBalanceMocks} from '../adapters/token-balance.mocks'
import {Portfolio} from '@yoroi/types'

describe('isPrimaryBalanceBreakdown', () => {
  it('should return true for a valid primary balance breakdown', () => {
    const validPrimaryBalanceBreakdown: Portfolio.BalancePrimaryBreakdown =
      tokenBalanceMocks.primaryETHBreakdown

    const result = isPrimaryBalanceBreakdown(validPrimaryBalanceBreakdown)

    expect(result).toBe(true)
  })

  it('should return false for an invalid primary balance breakdown', () => {
    const invalidPrimaryBalanceBreakdown = {
      ...tokenBalanceMocks.primaryETHBreakdown,
      minRequiredByTokens: 'invalid',
    }

    const result = isPrimaryBalanceBreakdown(invalidPrimaryBalanceBreakdown)

    expect(result).toBe(false)
  })
})

describe('parsePrimaryBalanceBreakdown', () => {
  it('should return a valid primary balance breakdown', () => {
    const validPrimaryBalanceBreakdown: Portfolio.BalancePrimaryBreakdown =
      tokenBalanceMocks.primaryETHBreakdown

    const result = parsePrimaryBalanceBreakdown(validPrimaryBalanceBreakdown)

    expect(result).toEqual(validPrimaryBalanceBreakdown)
  })

  it('should return undefined for an invalid primary balance breakdown', () => {
    const invalidPrimaryBalanceBreakdown = {
      ...tokenBalanceMocks.primaryETHBreakdown,
      minRequiredByTokens: 'invalid',
    }

    const result = parsePrimaryBalanceBreakdown(invalidPrimaryBalanceBreakdown)

    expect(result).toBeUndefined()
  })
})
