import BigNumber from 'bignumber.js'
import {tokenBalanceMocks} from '../adapters/token-balance.mocks'
import {amountBreakdown} from './amount-breakdown'

describe('amountBreakdown', () => {
  it('should correctly split the quantity based on decimals', () => {
    const result = amountBreakdown(tokenBalanceMocks.primaryETH)

    expect(result).toEqual({
      bi: 1000000n,
      bn: new BigNumber('1e-12'),
      decimalPlaces: 18,
      fraction: '000000000001000000',
      integer: '0',
      str: '0.000000000001000000',
    })
  })
})
