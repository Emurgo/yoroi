import {Swap, Balance} from '@yoroi/types'

import {getSellAmount} from './getSellAmount'

describe('getSellAmount', () => {
  it('should calculate the correct sell amount when buying tokenA', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: '4500000', tokenId: 'tokenA'},
      tokenB: {quantity: '9000000', tokenId: 'tokenB'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      fee: '0.5', // 0.5%
      provider: 'minswap',
      batcherFee: {quantity: '1', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }
    const buy: Balance.Amount = {
      quantity: '100',
      tokenId: 'tokenA',
    }
    const result = getSellAmount(pool, buy)
    expect(result.quantity).toBe('204')
    expect(result.tokenId).toBe('tokenB')

    const zeroResult = getSellAmount(pool, {...buy, quantity: '0'})
    expect(zeroResult.quantity).toBe('0')
    expect(zeroResult.tokenId).toBe('tokenB')

    const limitedResult = getSellAmount(pool, buy, true, '2.1')
    expect(limitedResult.quantity).toBe('210')
    expect(limitedResult.tokenId).toBe('tokenB')

    const zeroLimitResult = getSellAmount(
      {...pool, tokenA: {quantity: '0', tokenId: 'tokenA'}},
      buy,
      true,
    )
    expect(zeroLimitResult.quantity).toBe('0')
    expect(zeroLimitResult.tokenId).toBe('tokenB')
  })

  it('should calculate the correct sell amount when buying tokenB', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: '4500000', tokenId: 'tokenA'},
      tokenB: {quantity: '9000000', tokenId: 'tokenB'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      fee: '0.5', // 0.5%
      provider: 'minswap',
      batcherFee: {quantity: '1', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }
    const buy: Balance.Amount = {
      quantity: '100',
      tokenId: 'tokenB',
    }
    const result = getSellAmount(pool, buy)
    expect(result.quantity).toBe('53')
    expect(result.tokenId).toBe('tokenA')

    const limitedResult = getSellAmount(pool, buy, true, '2.1')
    expect(limitedResult.quantity).toBe('210')
    expect(limitedResult.tokenId).toBe('tokenA')
  })

  it('should return a big number when there is not enough balance', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: '1000000', tokenId: 'tokenA'},
      tokenB: {quantity: '2000000', tokenId: 'tokenB'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      fee: '10',
      provider: 'minswap',
      batcherFee: {quantity: '1', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }
    const buy: Balance.Amount = {
      quantity: '1000001',
      tokenId: 'tokenA',
    }
    const result = getSellAmount(pool, buy)
    expect(result.quantity).toBe('2222220000002')
    expect(result.tokenId).toBe('tokenB')
  })

  it('should calculate sell side as market without fee when initializing limit', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: '1000000', tokenId: 'tokenA'},
      tokenB: {quantity: '10000000', tokenId: 'tokenB'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      fee: '0.5',
      provider: 'minswap',
      batcherFee: {quantity: '1', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }
    const buy: Balance.Amount = {
      quantity: '100',
      tokenId: 'tokenA',
    }
    const limitResult = getSellAmount(pool, buy, true)
    const marketResult = getSellAmount(pool, buy)

    // need less on sell side (fee is not included)
    expect(limitResult.quantity).toBe('1000')
    expect(limitResult.tokenId).toBe('tokenB')

    // need more on sell side (fee is included)
    expect(marketResult.quantity).toBe('1008')
    expect(marketResult.tokenId).toBe('tokenB')
  })
})
