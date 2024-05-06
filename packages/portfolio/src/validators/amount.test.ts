import {Portfolio} from '@yoroi/types'
import {isAmount, parseAmount} from './amount'

describe('isAmount', () => {
  it('should return true for valid amount', () => {
    const amount: Portfolio.Amount = {
      id: 'dead.',
      quantity: BigInt(100),
    }

    const result = isAmount(amount)

    expect(result).toBe(true)
  })

  it('should return false for invalid amount', () => {
    const amount = {
      id: 'dead.',
      quantity: '100',
    }

    const result = isAmount(amount)

    expect(result).toBe(false)
  })
})

describe('parseAmount', () => {
  it('should return parsed amount for valid data', () => {
    const data = {
      id: 'dead.',
      quantity: BigInt(100),
    }

    const result = parseAmount(data)

    expect(result?.id).toBe(data.id)
    expect(result?.quantity).toBe(data.quantity)
  })

  it('should return undefined for invalid data', () => {
    const data = {
      id: 'dead.',
      quantity: '100',
    }

    const result = parseAmount(data)

    expect(result).toBeUndefined()
  })
})
