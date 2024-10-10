import {tokenInfoMocks} from '../../../tokenInfo.mocks'
import {getLiquidityProviderFee} from './getLiquidityProviderFee'

describe('getLiquidityProviderFee', () => {
  it('should return zero when sell quantity is zero', () => {
    const result = getLiquidityProviderFee('0.03', {
      info: tokenInfoMocks.a,
      quantity: 0n,
    })

    expect(result).toEqual({
      info: tokenInfoMocks.a,
      quantity: 0n,
    })
  })

  it('should calculate provider fee correctly based on sell side', () => {
    const expectedFee = 300n

    const result = getLiquidityProviderFee('0.03', {
      info: tokenInfoMocks.a,
      quantity: 1000000n,
    })

    expect(result).toEqual({
      info: tokenInfoMocks.a,
      quantity: expectedFee,
    })
  })

  it('should calculate fee ceil up', () => {
    const expectedFee = 66n

    const result = getLiquidityProviderFee('66.666666', {
      info: tokenInfoMocks.a,
      quantity: 99n,
    })

    expect(result).toEqual({
      info: tokenInfoMocks.a,
      quantity: expectedFee,
    })
  })
})
