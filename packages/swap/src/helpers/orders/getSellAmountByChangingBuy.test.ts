import {Portfolio, Swap} from '@yoroi/types'

import {getSellAmountByChangingBuy} from './getSellAmountByChangingBuy'

describe('getSellAmountByChangingBuy', () => {
  it('should calculate the correct sell amount when buying tokenA', () => {
    const pool = {
      tokenA: {quantity: '4500000', tokenId: 'tokenA'},
      tokenB: {quantity: '9000000', tokenId: 'tokenB'},
      fee: '0.5', // 0.5%
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
    const buy: Portfolio.Amount = {
      quantity: '100',
      tokenId: 'tokenA',
    }
    const result = getSellAmountByChangingBuy(pool, buy)
    expect(result.buy).toEqual(buy)
    expect(result.sell.quantity).toBe('204')
    expect(result.sell.tokenId).toBe('tokenB')
  })

  it('should calculate the correct sell amount when buying tokenB', () => {
    const pool = {
      tokenA: {quantity: '4500000', tokenId: 'tokenA'},
      tokenB: {quantity: '9000000', tokenId: 'tokenB'},
      fee: '0.5', // 0.5%
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
    const buy: Portfolio.Amount = {
      quantity: '100',
      tokenId: 'tokenB',
    }
    const result = getSellAmountByChangingBuy(pool, buy)
    expect(result.buy).toEqual(buy)
    expect(result.sell.quantity).toBe('53')
    expect(result.sell.tokenId).toBe('tokenA')
  })

  it('should return a big number when there is not enough balance', () => {
    const pool = {
      tokenA: {quantity: '1000000', tokenId: 'tokenA'},
      tokenB: {quantity: '2000000', tokenId: 'tokenB'},
      fee: '10',
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
    const buy: Portfolio.Amount = {
      quantity: '1000001',
      tokenId: 'tokenA',
    }
    const result = getSellAmountByChangingBuy(pool, buy)
    expect(result.buy).toEqual(buy)
    // TODO: check why the fee is always in lovelace when swaping tokens other then ADA
    expect(result.sell.quantity).toBe('2222220000002')
    expect(result.sell.tokenId).toBe('tokenB')
  })
})
