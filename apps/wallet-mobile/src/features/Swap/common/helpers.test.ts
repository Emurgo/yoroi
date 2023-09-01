import {getBuyQuantityForLimitOrder, getSellQuantityForLimitOrder} from './helpers'

describe('getBuyQuantityForLimitOrder', () => {
  it('should return 0 if the sell quantity is 0', () => {
    expect(getBuyQuantityForLimitOrder('0', '12.34', 6)).toBe('0')
  })

  it('should return sell quantity / limit price', () => {
    expect(getBuyQuantityForLimitOrder('100', '20', 0)).toBe('5')
  })

  it('should take decimals into consideration', () => {
    expect(getBuyQuantityForLimitOrder('100', '20', 2)).toBe('500')
  })
})

describe('getSellQuantityForLimitOrder', () => {
  it('should return 0 if the sell quantity is 0', () => {
    expect(getSellQuantityForLimitOrder('0', '12.34', 6)).toBe('0')
  })

  it('should return buy quantity * limit price', () => {
    expect(getSellQuantityForLimitOrder('100', '20', 0)).toBe('2000')
  })

  it('should take decimals into consideration', () => {
    expect(getSellQuantityForLimitOrder('100', '20', 2)).toBe('200000')
  })
})
