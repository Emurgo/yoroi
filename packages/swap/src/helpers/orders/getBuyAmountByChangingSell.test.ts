import {Swap, Balance} from '@yoroi/types'

import {getBuyAmountbyChangingSell} from './getBuyAmountByChangingSell'

describe('getReceiveAmountbyChangingSell', () => {
  it('should calculate the correct receive amount when selling tokenA', () => {
    const pool = {
      tokenA: {quantity: '4500000', tokenId: 'tokenA'},
      tokenB: {quantity: '9000000', tokenId: 'tokenB'},
      fee: '0.3', // 0.3%
      provider: 'minswap',
      price: 2,
      batcherFee: {quantity: '1', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    } as Swap.Pool
    const sell: Balance.Amount = {
      quantity: '100',
      tokenId: 'tokenA',
    }
    const result = getBuyAmountbyChangingSell(pool, sell)
    expect(result.sell).toEqual(sell)
    expect(result.buy.quantity).toBe('197')
    expect(result.buy.tokenId).toBe('tokenB')
  })

  it('should calculate the correct receive amount when selling tokenB', () => {
    const pool = {
      tokenA: {quantity: '4500000', tokenId: 'tokenA'},
      tokenB: {quantity: '9000000', tokenId: 'tokenB'},
      fee: '0.3', // 0.3%
      provider: 'minswap',
      price: 2,
      batcherFee: {quantity: '1', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    } as Swap.Pool
    const sell: Balance.Amount = {
      quantity: '100',
      tokenId: 'tokenB',
    }
    const result = getBuyAmountbyChangingSell(pool, sell)
    expect(result.sell).toEqual(sell)
    expect(result.buy.quantity).toBe('49')
    expect(result.buy.tokenId).toBe('tokenA')
  })
})
