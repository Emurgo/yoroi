import {Quantities} from '../../../utils/quantities'
import {getLiquidityProviderFee} from './getLiquidityProviderFee'
import {asQuantity} from '../../../utils/asQuantity'

describe('getLiquidityProviderFee', () => {
  it('should return zero when sell quantity is zero', () => {
    const result = getLiquidityProviderFee('0.03', {
      tokenId: 'testToken',
      quantity: Quantities.zero,
    })

    expect(result).toEqual({
      tokenId: 'testToken',
      quantity: Quantities.zero,
    })
  })

  it('should calculate provider fee correctly based on sell side', () => {
    const expectedFee = '300'

    const result = getLiquidityProviderFee('0.03', {
      tokenId: 'testToken',
      quantity: '1000000',
    })

    expect(result).toEqual({
      tokenId: 'testToken',
      quantity: asQuantity(expectedFee),
    })
  })

  it('should calculate fee ceil up', () => {
    const expectedFee = '66'

    const result = getLiquidityProviderFee('66.666666', {
      tokenId: 'testToken',
      quantity: '99',
    })

    expect(result).toEqual({
      tokenId: 'testToken',
      quantity: asQuantity(expectedFee),
    })
  })
})
