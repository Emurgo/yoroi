import {isPrimaryBreakdown, parsePrimaryBreakdown} from './primary-breakdown'
import {tokenBalanceMocks} from '../adapters/token-balance.mocks'
import {Portfolio} from '@yoroi/types'

describe('isPrimaryBreakdown', () => {
  it('should return true for a valid primary balance breakdown', () => {
    const validPrimaryBalanceBreakdown: Portfolio.PrimaryBreakdown =
      tokenBalanceMocks.primaryETHBreakdown

    const result = isPrimaryBreakdown(validPrimaryBalanceBreakdown)

    expect(result).toBe(true)
  })

  it('should return false for an invalid primary balance breakdown', () => {
    const invalidPrimaryBalanceBreakdown = {
      x: 'invalid',
    }

    const result = isPrimaryBreakdown(invalidPrimaryBalanceBreakdown)

    expect(result).toBe(false)
  })
})

describe('parsePrimaryBreakdown', () => {
  it('should return a valid primary balance breakdown', () => {
    const validPrimaryBalanceBreakdown: Portfolio.PrimaryBreakdown =
      tokenBalanceMocks.primaryETHBreakdown

    const result = parsePrimaryBreakdown(validPrimaryBalanceBreakdown)

    expect(result).toEqual(validPrimaryBalanceBreakdown)
  })

  it('should return undefined for an invalid primary balance breakdown', () => {
    const invalidPrimaryBalanceBreakdown = {
      x: 'invalid',
    }

    const result = parsePrimaryBreakdown(invalidPrimaryBalanceBreakdown)

    expect(result).toBeUndefined()
  })
})
