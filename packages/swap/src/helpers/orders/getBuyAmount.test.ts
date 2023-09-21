import {Swap, Balance} from '@yoroi/types'

import {getBuyAmount} from './getBuyAmount'

describe('getBuyAmount', () => {
  it('should calculate the correct buy amount when selling tokenA', () => {
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
    const result = getBuyAmount(pool, sell)
    expect(result.quantity).toBe('197')
    expect(result.tokenId).toBe('tokenB')

    const limitedResult = getBuyAmount(pool, sell, '2.1')
    expect(limitedResult.quantity).toBe('207')
    expect(limitedResult.tokenId).toBe('tokenB')
  })

  it('should calculate the correct buy amount when selling tokenB', () => {
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
    const result = getBuyAmount(pool, sell)
    expect(result.quantity).toBe('49')
    expect(result.tokenId).toBe('tokenA')

    const limitedResult = getBuyAmount(pool, sell, '2.1')
    expect(limitedResult.quantity).toBe('47')
    expect(limitedResult.tokenId).toBe('tokenA')
  })
})
