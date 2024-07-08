import {Portfolio, Swap} from '@yoroi/types'

import {getBestSellPool} from './getBestSellPool'
import {getSellAmount} from '../orders/amounts/getSellAmount'
import {mocks} from '../mocks'
import {tokenInfoMocks} from '../../tokenInfo.mocks'

describe('getBestSellPool', () => {
  it('should return pool with min possible tokens to sell', () => {
    const buy: Portfolio.Token.Amount = {
      quantity: 1000000000n,
      info: tokenInfoMocks.b,
    }

    const pools = mocks.mockedPools3
    const bestSellPool = getBestSellPool(pools, buy, tokenInfoMocks.a)

    expect(bestSellPool?.provider).toBe('minswap')
    const sellAmount = getSellAmount(bestSellPool!, buy, tokenInfoMocks.a)
    expect(sellAmount.quantity).toBe(69709507n)
  })

  it('should return pool with min possible tokens to sell (opposite test)', () => {
    const buy: Portfolio.Token.Amount = {
      quantity: 1000000000n,
      info: tokenInfoMocks.a,
    }

    const pools = mocks.mockedPools4
    const bestSellPool = getBestSellPool(pools, buy, tokenInfoMocks.b)

    if (bestSellPool) {
      expect(bestSellPool.provider).toBe('minswap')
      const sellAmount = getSellAmount(bestSellPool, buy, tokenInfoMocks.b)
      expect(sellAmount.quantity).toBe(69709507n)
    } else {
      fail('bestSellPool is undefined')
    }
  })

  it('should return undefined if buy amount is 0', () => {
    const sell: Portfolio.Token.Amount = {
      quantity: 0n,
      info: tokenInfoMocks.a,
    }

    expect(
      getBestSellPool([mocks.mockedPools4[0]!], sell, tokenInfoMocks.b),
    ).toBeUndefined()
  })

  it('should return undefined if the sell quantity turns to be 0', () => {
    const pools: Array<Swap.Pool> = [
      {
        tokenA: {quantity: 0n, tokenId: 'tokenA.'},
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

    const buy: Portfolio.Token.Amount = {
      quantity: 1000000000000000n,
      info: tokenInfoMocks.a,
    }

    expect(getBestSellPool(pools, buy, tokenInfoMocks.b)).toBeUndefined()
  })

  it('should return undefined if pools list is empty', () => {
    const sell: Portfolio.Token.Amount = {
      quantity: 1n,
      info: tokenInfoMocks.a,
    }

    expect(getBestSellPool([], sell, tokenInfoMocks.b)).toBeUndefined()
  })
})
