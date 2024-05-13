import {Portfolio} from '@yoroi/types'

import {
  TokenAmountSchema,
  isTokenAmount,
  parseTokenAmount,
} from './token-amount'
import {tokenInfoMocks} from '../adapters/token-info.mocks'

describe('TokenAmountSchema', () => {
  it('should validate a valid token balance', () => {
    const validTokenBalance: Portfolio.Token.Amount = {
      info: tokenInfoMocks.ftNoTicker,
      quantity: BigInt(10000000000),
    }

    const result = TokenAmountSchema.safeParse(validTokenBalance)

    expect(result.success).toBe(true)
  })

  it('should not validate an invalid token balance', () => {
    const invalidTokenBalance: Portfolio.Token.Amount = {
      info: tokenInfoMocks.ftNoTicker,
      quantity: '10000000000',
    } as any

    const result = TokenAmountSchema.safeParse(invalidTokenBalance)

    expect(result.success).toBe(false)
  })
})

describe('isTokenAmount', () => {
  it('should return true for a valid token balance', () => {
    const validTokenBalance: Portfolio.Token.Amount = {
      info: tokenInfoMocks.ftNoTicker,
      quantity: BigInt(10000000000),
    }

    const result = isTokenAmount(validTokenBalance)

    expect(result).toBe(true)
  })

  it('should return false for an invalid token balance', () => {
    const invalidTokenBalance = {
      info: tokenInfoMocks.ftNoTicker,
      quantity: '10000000000',
    }

    const result = isTokenAmount(invalidTokenBalance)

    expect(result).toBe(false)
  })
})

describe('parseTokenAmount', () => {
  it('should return a valid token balance', () => {
    const validTokenBalance: Portfolio.Token.Amount = {
      info: tokenInfoMocks.ftNoTicker,
      quantity: BigInt(10000000000),
    }

    const result = parseTokenAmount(validTokenBalance)

    expect(result).toEqual(validTokenBalance)
  })

  it('should return undefined for an invalid token balance', () => {
    const invalidTokenBalance = {
      info: tokenInfoMocks.ftNoTicker,
      quantity: '10000000000',
    }

    const result = parseTokenAmount(invalidTokenBalance)

    expect(result).toBeUndefined()
  })

  it('should return undefined for an unknown data type', () => {
    const unknownData = 'unknown'

    const result = parseTokenAmount(unknownData)

    expect(result).toBeUndefined()
  })
})
