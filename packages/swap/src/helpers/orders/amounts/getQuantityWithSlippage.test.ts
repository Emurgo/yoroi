import {getQuantityWithSlippage} from './getQuantityWithSlippage'

describe('getQuantityWithSlippage', () => {
  it('should calculate the correct quantity after applying slippage', () => {
    expect(getQuantityWithSlippage(`1000`, 0.1)).toBe(`999`)
    expect(getQuantityWithSlippage(`1000`, 1)).toBe(`990`)
    expect(getQuantityWithSlippage(`1000`, 10)).toBe(`900`)
    expect(getQuantityWithSlippage(`1000`, 100)).toBe(`0`)
    expect(getQuantityWithSlippage(`500`, 0.5)).toBe(`497`)
  })

  it('should return the original quantity when slippage is zero', () => {
    expect(getQuantityWithSlippage(`1000`, 0)).toBe(`1000`)
  })

  it('should return zero when the quantity is zero', () => {
    expect(getQuantityWithSlippage(`0`, 10)).toBe(`0`)
  })

  it('should handle negative slippage as 0%', () => {
    expect(getQuantityWithSlippage(`1000`, -0.1)).toBe(`1000`)
  })
})
