import {getQuantityWithSlippage} from './getQuantityWithSlippage'

describe('getQuantityWithSlippage', () => {
  it('should calculate the correct quantity after applying slippage', () => {
    expect(getQuantityWithSlippage(1000n, 0.1)).toBe(999n)
    expect(getQuantityWithSlippage(1000n, 1)).toBe(990n)
    expect(getQuantityWithSlippage(1000n, 10)).toBe(900n)
    expect(getQuantityWithSlippage(1000n, 100)).toBe(0n)
    expect(getQuantityWithSlippage(500n, 0.5)).toBe(497n)
  })

  it('should return the original quantity when slippage is zero', () => {
    expect(getQuantityWithSlippage(1000n, 0)).toBe(1000n)
  })

  it('should return zero when the quantity is zero', () => {
    expect(getQuantityWithSlippage(0n, 10)).toBe(0n)
  })

  it('should handle negative slippage as 0%', () => {
    expect(getQuantityWithSlippage(1000n, -0.1)).toBe(1000n)
  })
})
