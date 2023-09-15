import {getQuantityWithSlippage} from './getQuantityWithSlippage'

describe('getQuantityWithSlippage', () => {
  it('should calculate the correct quantity after applying slippage', () => {
    expect(getQuantityWithSlippage(BigInt(1000), BigInt(10))).toBe(BigInt(900))
    expect(getQuantityWithSlippage(BigInt(500), BigInt(50))).toBe(BigInt(250))
  })

  it('should return the original quantity when slippage is zero', () => {
    expect(getQuantityWithSlippage(BigInt(1000), BigInt(0))).toBe(BigInt(1000))
  })

  it('should return zero when the quantity is zero', () => {
    expect(getQuantityWithSlippage(BigInt(0), BigInt(10))).toBe(BigInt(0))
  })

  it('should handle negative slippage as 0%', () => {
    expect(getQuantityWithSlippage(BigInt(1000), BigInt(-10))).toBe(
      BigInt(1000),
    )
  })
})
