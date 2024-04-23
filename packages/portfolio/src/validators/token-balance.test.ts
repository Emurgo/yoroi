import {Portfolio} from '@yoroi/types'

import {
  TokenBalanceSchema,
  isTokenBalance,
  parseTokenBalance,
} from './token-balance'
import {tokenInfoMocks} from '../adapters/token-info.mocks'

describe('TokenBalanceSchema', () => {
  it('should validate a valid token balance', () => {
    const validTokenBalance: Portfolio.Token.Balance = {
      info: tokenInfoMocks.ftNoTicker,
      balance: BigInt(10000000000),
    }

    const result = TokenBalanceSchema.safeParse(validTokenBalance)

    expect(result.success).toBe(true)
  })

  it('should not validate an invalid token balance', () => {
    const invalidTokenBalance = {
      info: tokenInfoMocks.ftNoTicker,
      balance: '10000000000',
    }

    const result = TokenBalanceSchema.safeParse(invalidTokenBalance)

    expect(result.success).toBe(false)
  })
})

describe('isTokenBalance', () => {
  it('should return true for a valid token balance', () => {
    const validTokenBalance: Portfolio.Token.Balance = {
      info: tokenInfoMocks.ftNoTicker,
      balance: BigInt(10000000000),
    }

    const result = isTokenBalance(validTokenBalance)

    expect(result).toBe(true)
  })

  it('should return false for an invalid token balance', () => {
    const invalidTokenBalance = {
      info: tokenInfoMocks.ftNoTicker,
      balance: '10000000000',
    }

    const result = isTokenBalance(invalidTokenBalance)

    expect(result).toBe(false)
  })
})

describe('parseTokenBalance', () => {
  it('should return a valid token balance', () => {
    const validTokenBalance: Portfolio.Token.Balance = {
      info: tokenInfoMocks.ftNoTicker,
      balance: BigInt(10000000000),
    }

    const result = parseTokenBalance(validTokenBalance)

    expect(result).toEqual(validTokenBalance)
  })

  it('should return undefined for an invalid token balance', () => {
    const invalidTokenBalance = {
      info: tokenInfoMocks.ftNoTicker,
      balance: '10000000000',
    }

    const result = parseTokenBalance(invalidTokenBalance)

    expect(result).toBeUndefined()
  })

  it('should return undefined for an unknown data type', () => {
    const unknownData = 'unknown'

    const result = parseTokenBalance(unknownData)

    expect(result).toBeUndefined()
  })
})
