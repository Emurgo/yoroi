import {Swap, Portfolio} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'

import {getSellAmount} from './getSellAmount'
import {tokenInfoMocks} from '../../../tokenInfo.mocks'

describe('getSellAmount', () => {
  it('should calculate the correct sell amount when buying tokenA', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: 4500000n, tokenId: 'tokenA.'},
      tokenB: {quantity: 9000000n, tokenId: 'tokenB.'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      fee: '0.5', // 0.5%
      provider: 'minswap',
      batcherFee: {quantity: 1n, tokenId: '.'},
      deposit: {quantity: 1n, tokenId: '.'},
      poolId: '0',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
      },
    }
    const buy: Portfolio.Token.Amount = {
      quantity: 100n,
      info: tokenInfoMocks.a,
    }
    const result = getSellAmount(pool, buy, tokenInfoMocks.b)
    expect(result.quantity).toBe(204n)
    expect(result.info).toEqual(tokenInfoMocks.b)

    const zeroResult = getSellAmount(
      pool,
      {...buy, quantity: 0n},
      tokenInfoMocks.b,
    )
    expect(zeroResult.quantity).toBe(0n)
    expect(zeroResult.info).toEqual(tokenInfoMocks.b)

    const limitedResult = getSellAmount(
      pool,
      buy,
      tokenInfoMocks.b,
      true,
      new BigNumber(2.1),
    )
    expect(limitedResult.quantity).toBe(210n)
    expect(limitedResult.info).toEqual(tokenInfoMocks.b)

    const zeroLimitResult = getSellAmount(
      {...pool, tokenA: {quantity: 0n, tokenId: 'tokenA.'}},
      buy,
      tokenInfoMocks.b,
      true,
    )
    expect(zeroLimitResult.quantity).toBe(0n)
    expect(zeroLimitResult.info).toEqual(tokenInfoMocks.b)
  })

  it('should calculate the correct sell amount when buying tokenB', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: 4500000n, tokenId: 'tokenA.'},
      tokenB: {quantity: 9000000n, tokenId: 'tokenB.'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      fee: '0.5', // 0.5%
      provider: 'minswap',
      batcherFee: {quantity: 1n, tokenId: '.'},
      deposit: {quantity: 1n, tokenId: '.'},
      poolId: '0',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
      },
    }
    const buy: Portfolio.Token.Amount = {
      quantity: 100n,
      info: tokenInfoMocks.b,
    }
    const result = getSellAmount(pool, buy, tokenInfoMocks.a)
    expect(result.quantity).toBe(53n)
    expect(result.info).toEqual(tokenInfoMocks.a)

    const limitedResult = getSellAmount(
      pool,
      buy,
      tokenInfoMocks.a,
      true,
      new BigNumber(2.1),
    )
    expect(limitedResult.quantity).toBe(210n)
    expect(limitedResult.info).toEqual(tokenInfoMocks.a)
  })

  it('should return a big number when there is not enough balance', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: 1000000n, tokenId: 'tokenA.'},
      tokenB: {quantity: 2000000n, tokenId: 'tokenB.'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      fee: '10',
      provider: 'minswap',
      batcherFee: {quantity: 1n, tokenId: '.'},
      deposit: {quantity: 1n, tokenId: '.'},
      poolId: '0',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
      },
    }
    const buy: Portfolio.Token.Amount = {
      quantity: 1000001n,
      info: tokenInfoMocks.a,
    }
    const result = getSellAmount(pool, buy, tokenInfoMocks.b)
    expect(result.quantity).toBe(2222220000002n)
    expect(result.info).toEqual(tokenInfoMocks.b)
  })

  it('should calculate sell side as market without fee when initializing limit', () => {
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
    const buy: Portfolio.Token.Amount = {
      quantity: 100n,
      info: tokenInfoMocks.a,
    }
    const limitResult = getSellAmount(pool, buy, tokenInfoMocks.b, true)
    const marketResult = getSellAmount(pool, buy, tokenInfoMocks.b)

    // need less on sell side (fee is not included)
    expect(limitResult.quantity).toBe(1000n)
    expect(limitResult.info).toBe(tokenInfoMocks.b)

    // need more on sell side (fee is included)
    expect(marketResult.quantity).toBe(1008n)
    expect(marketResult.info).toBe(tokenInfoMocks.b)
  })
})
