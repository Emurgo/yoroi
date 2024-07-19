import {Swap, Portfolio} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'

import {getBuyAmount} from './getBuyAmount'
import {tokenInfoMocks} from '../../../tokenInfo.mocks'

describe('getBuyAmount', () => {
  it('should calculate the correct buy amount when selling tokenA', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: 4500000n, tokenId: 'tokenA.'},
      tokenB: {quantity: 9000000n, tokenId: 'tokenB.'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      batcherFee: {quantity: 1n, tokenId: '.'},
      deposit: {quantity: 1n, tokenId: '.'},
      poolId: '0',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
      },
    }
    const sell: Portfolio.Token.Amount = {
      quantity: 100n,
      info: tokenInfoMocks.a,
    }
    const result = getBuyAmount(pool, sell, tokenInfoMocks.b)
    expect(result.quantity).toBe(197n)
    expect(result.info).toEqual(tokenInfoMocks.b)

    const limitedResult = getBuyAmount(
      pool,
      sell,
      tokenInfoMocks.b,
      true,
      new BigNumber(2.1),
    )
    expect(limitedResult.quantity).toBe(47n)
    expect(limitedResult.info).toEqual(tokenInfoMocks.b)

    const zeroLimitResult = getBuyAmount(
      {...pool, tokenA: {quantity: 0n, tokenId: 'tokenA.'}},
      sell,
      tokenInfoMocks.b,
      true,
    )
    expect(zeroLimitResult.quantity).toBe(0n)
    expect(zeroLimitResult.info).toEqual(tokenInfoMocks.b)
  })

  it('should calculate the correct buy amount when selling tokenA (muesli example)', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: 2022328173071n, tokenId: '.'},
      tokenB: {quantity: 277153n, tokenId: 'tokenB.'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      fee: '0.3', // 0.3%
      provider: 'muesliswap',
      batcherFee: {quantity: 950000n, tokenId: '.'},
      deposit: {quantity: 2000000n, tokenId: '.'},
      poolId: '0',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
      },
    }
    const sell: Portfolio.Token.Amount = {
      quantity: 1000000000n,
      info: tokenInfoMocks.pt,
    }
    const result = getBuyAmount(pool, sell, tokenInfoMocks.b)
    expect(result.quantity).toBe(136n)
    expect(result.info).toEqual(tokenInfoMocks.b)

    const limitedResult = getBuyAmount(
      pool,
      sell,
      tokenInfoMocks.b,
      true,
      new BigNumber(2.1),
    )
    expect(limitedResult.quantity).toBe(476190476n)
    expect(limitedResult.info).toEqual(tokenInfoMocks.b)
  })

  it('should calculate the correct buy amount when selling tokenB', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: 4500000n, tokenId: 'tokenA.'},
      tokenB: {quantity: 9000000n, tokenId: 'tokenB.'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      batcherFee: {quantity: 1n, tokenId: '.'},
      deposit: {quantity: 1n, tokenId: '.'},
      poolId: '0',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
      },
    }
    const sell: Portfolio.Token.Amount = {
      quantity: 100n,
      info: tokenInfoMocks.b,
    }
    const result = getBuyAmount(pool, sell, tokenInfoMocks.a)
    expect(result.quantity).toBe(49n)
    expect(result.info).toEqual(tokenInfoMocks.a)

    const limitedResult = getBuyAmount(
      pool,
      sell,
      tokenInfoMocks.a,
      true,
      new BigNumber(2.1),
    )
    expect(limitedResult.quantity).toBe(47n)
    expect(limitedResult.info).toEqual(tokenInfoMocks.a)
  })

  it('should calculate buy side as market without fee when initializing limit', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: 1000000n, tokenId: 'tokenA.'},
      tokenB: {quantity: 10000000n, tokenId: 'tokenB.'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      fee: '0.5',
      provider: 'minswap',
      batcherFee: {quantity: 1n, tokenId: '.'},
      deposit: {quantity: 1n, tokenId: '.'},
      poolId: '0',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
      },
    }
    const sell: Portfolio.Token.Amount = {
      quantity: 100n,
      info: tokenInfoMocks.a,
    }
    const limitResult = getBuyAmount(pool, sell, tokenInfoMocks.b, true)
    const marketResult = getBuyAmount(pool, sell, tokenInfoMocks.b)

    // buy more (fee not included)
    expect(limitResult.quantity).toBe(1000n)
    expect(limitResult.info).toEqual(tokenInfoMocks.b)

    // buy less (fee included)
    expect(marketResult.quantity).toBe(989n)
    expect(marketResult.info).toEqual(tokenInfoMocks.b)
  })
})
