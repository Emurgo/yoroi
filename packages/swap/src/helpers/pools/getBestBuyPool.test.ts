import {Portfolio, Swap} from '@yoroi/types'

import {getBestBuyPool} from './getBestBuyPool'
import {getBuyAmount} from '../orders/amounts/getBuyAmount'
import {mocks} from '../mocks'
import {tokenInfoMocks} from '../../tokenInfo.mocks'

describe('getBestBuyPool', () => {
  it('should return pool with maximin possible tokens to buy', () => {
    const sell: Portfolio.Token.Amount = {
      quantity: 10000000000n,
      info: tokenInfoMocks.b,
    }

    const pools = mocks.mockedPools1
    const bestBuyPool = getBestBuyPool(pools, sell, tokenInfoMocks.a)
    if (bestBuyPool) {
      expect(bestBuyPool.provider).toBe('minswap')
      const buyAmount = getBuyAmount(bestBuyPool, sell, tokenInfoMocks.a)
      expect(buyAmount.quantity).toBe(693300972n)
    } else {
      fail('bestBuyPool undefined')
    }
  })

  it('should return pool with maximin possible tokens to buy (case 2)', () => {
    const sell: Portfolio.Token.Amount = {
      quantity: 1000000000n,
      info: tokenInfoMocks.a,
    }

    const pools = mocks.mockedPools2
    const bestBuyPool = getBestBuyPool(pools, sell, tokenInfoMocks.b)
    expect(bestBuyPool?.provider).toBe('minswap')
    const buyAmount = getBuyAmount(bestBuyPool!, sell, tokenInfoMocks.b)
    expect(buyAmount.quantity).toBe(14336451239n)
  })

  it('should return undefined if sell amount is 0', () => {
    const sell: Portfolio.Token.Amount = {
      quantity: 0n,
      info: tokenInfoMocks.a,
    }

    expect(
      getBestBuyPool([mocks.mockedPools1[0]!], sell, tokenInfoMocks.b),
    ).toBeUndefined()
  })

  it('should return undefined if the buy quantity turns to be 0', () => {
    const pools: Array<Swap.Pool> = [
      {
        tokenA: {quantity: 1000000000000000000000n, tokenId: 'tokenA.'},
        tokenB: {quantity: 1n, tokenId: 'tokenB.'},
        ptPriceTokenA: '1',
        ptPriceTokenB: '0.0695404765',
        fee: '0.3', // 0.3%
        provider: 'muesliswap_v2',
        batcherFee: {quantity: 950000n, tokenId: '.'},
        deposit: {quantity: 2000000n, tokenId: '.'},
        poolId: '1',
        lpToken: {
          quantity: 0n,
          tokenId: '0.',
        },
      },
    ]

    const sell: Portfolio.Token.Amount = {
      quantity: 1n,
      info: tokenInfoMocks.a,
    }

    expect(getBestBuyPool(pools, sell, tokenInfoMocks.b)).toBeUndefined()
  })

  it('should return undefined if pools list is empty', () => {
    const sell: Portfolio.Token.Amount = {
      quantity: 1n,
      info: tokenInfoMocks.a,
    }

    expect(getBestBuyPool([], sell, tokenInfoMocks.b)).toBeUndefined()
  })
})
