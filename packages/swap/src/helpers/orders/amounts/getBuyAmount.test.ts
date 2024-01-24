import {Swap, Balance} from '@yoroi/types'

import {getBuyAmount} from './getBuyAmount'

describe('getBuyAmount', () => {
  it('should calculate the correct buy amount when selling tokenA', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: '4500000', tokenId: 'tokenA'},
      tokenB: {quantity: '9000000', tokenId: 'tokenB'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      batcherFee: {quantity: '1', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }
    const sell: Balance.Amount = {
      quantity: '100',
      tokenId: 'tokenA',
    }
    const result = getBuyAmount(pool, sell)
    expect(result.quantity).toBe('197')
    expect(result.tokenId).toBe('tokenB')

    const limitedResult = getBuyAmount(pool, sell, true, '2.1')
    expect(limitedResult.quantity).toBe('47')
    expect(limitedResult.tokenId).toBe('tokenB')

    const zeroLimitResult = getBuyAmount(
      {...pool, tokenA: {quantity: '0', tokenId: 'tokenA'}},
      sell,
      true,
    )
    expect(zeroLimitResult.quantity).toBe('0')
    expect(zeroLimitResult.tokenId).toBe('tokenB')
  })

  it('should calculate the correct buy amount when selling tokenA (muesli example)', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: '2022328173071', tokenId: ''},
      tokenB: {quantity: '277153', tokenId: 'tokenB'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      fee: '0.3', // 0.3%
      provider: 'muesliswap',
      batcherFee: {quantity: '950000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }
    const sell: Balance.Amount = {
      quantity: '1000000000',
      tokenId: '',
    }
    const result = getBuyAmount(pool, sell)
    expect(result.quantity).toBe('136')
    expect(result.tokenId).toBe('tokenB')

    const limitedResult = getBuyAmount(pool, sell, true, '2.1')
    //expect(limitedResult.quantity).toBe('47')
    expect(limitedResult.tokenId).toBe('tokenB')
  })

  it('should calculate the correct buy amount when selling tokenB', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: '4500000', tokenId: 'tokenA'},
      tokenB: {quantity: '9000000', tokenId: 'tokenB'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      batcherFee: {quantity: '1', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }
    const sell: Balance.Amount = {
      quantity: '100',
      tokenId: 'tokenB',
    }
    const result = getBuyAmount(pool, sell)
    expect(result.quantity).toBe('49')
    expect(result.tokenId).toBe('tokenA')

    const limitedResult = getBuyAmount(pool, sell, true, '2.1')
    expect(limitedResult.quantity).toBe('47')
    expect(limitedResult.tokenId).toBe('tokenA')
  })

  it('should calculate buy side as market without fee when initializing limit', () => {
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
    const sell: Balance.Amount = {
      quantity: '100',
      tokenId: 'tokenA',
    }
    const limitResult = getBuyAmount(pool, sell, true)
    const marketResult = getBuyAmount(pool, sell)

    // buy more (fee not included)
    expect(limitResult.quantity).toBe('1000')
    expect(limitResult.tokenId).toBe('tokenB')

    // buy less (fee included)
    expect(marketResult.quantity).toBe('989')
    expect(marketResult.tokenId).toBe('tokenB')
  })
})
