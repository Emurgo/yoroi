import {Swap, Balance} from '@yoroi/types'

import {getMarketPrice} from './getMarketPrice'

describe('getMarketPrice', () => {
  it('should calculate the correct market price when selling tokenA', () => {
    const pool = {
      tokenA: {quantity: '4500000', tokenId: 'tokenA'},
      tokenB: {quantity: '9000000', tokenId: 'tokenB'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      price: 2,
      batcherFee: {quantity: '1', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    } as Swap.Pool
    const sell: Balance.Amount = {
      quantity: '100',
      tokenId: 'tokenA',
    }
    const result = getMarketPrice(pool, sell.tokenId)
    expect(result).toBe('0.5')
  })

  it('should calculate the correct market price when selling tokenB', () => {
    const pool = {
      tokenA: {quantity: '4500000', tokenId: 'tokenA'},
      tokenB: {quantity: '9000000', tokenId: 'tokenB'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      price: 2,
      batcherFee: {quantity: '1', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    } as Swap.Pool
    const sell: Balance.Amount = {
      quantity: '100',
      tokenId: 'tokenB',
    }
    const result = getMarketPrice(pool, sell.tokenId)
    expect(result).toBe('2')
  })
})
