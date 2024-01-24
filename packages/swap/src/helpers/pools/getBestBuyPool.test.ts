import {Balance, Swap} from '@yoroi/types'

import {getBestBuyPool} from './getBestBuyPool'
import {getBuyAmount} from '../orders/amounts/getBuyAmount'
import {mocks} from '../mocks'

describe('getBestBuyPool', () => {
  it('should return pool with maximin possible tokens to buy', () => {
    const sell: Balance.Amount = {
      quantity: '10000000000',
      tokenId: 'tokenB',
    }

    const pools = mocks.mockedPools1
    const bestBuyPool = getBestBuyPool(pools, sell)
    if (bestBuyPool) {
      expect(bestBuyPool.provider).toBe('minswap')
      const buyAmount = getBuyAmount(bestBuyPool, sell)
      expect(buyAmount.quantity).toBe('693300972')
    } else {
      fail('bestBuyPool undefined')
    }
  })

  it('should return pool with maximin possible tokens to buy (case 2)', () => {
    const sell: Balance.Amount = {
      quantity: '1000000000',
      tokenId: 'tokenA',
    }

    const pools = mocks.mockedPools2
    const bestBuyPool = getBestBuyPool(pools, sell)
    if (bestBuyPool) {
      expect(bestBuyPool.provider).toBe('minswap')
      const buyAmount = getBuyAmount(bestBuyPool, sell)
      expect(buyAmount.quantity).toBe('14336451239')
    } else {
      fail('bestBuyPool undefined')
    }
  })

  it('should return undefined if sell amount is 0', () => {
    const sell: Balance.Amount = {
      quantity: '0',
      tokenId: 'tokenA',
    }

    expect(getBestBuyPool([mocks.mockedPools1[0]!], sell)).toBeUndefined()
  })

  it('should return undefined if the buy quantity turns to be 0', () => {
    const pools: Array<Swap.Pool> = [
      {
        tokenA: {quantity: '1000000000000000000000', tokenId: 'tokenA'},
        tokenB: {quantity: '1', tokenId: 'tokenB'},
        ptPriceTokenA: '1',
        ptPriceTokenB: '0.0695404765',
        fee: '0.3', // 0.3%
        provider: 'muesliswap_v2',
        batcherFee: {quantity: '950000', tokenId: ''},
        deposit: {quantity: '2000000', tokenId: ''},
        poolId: '1',
        lpToken: {
          quantity: '0',
          tokenId: '0',
        },
      },
    ]

    const sell: Balance.Amount = {
      quantity: '1',
      tokenId: 'tokenA',
    }

    expect(getBestBuyPool(pools, sell)).toBeUndefined()
  })

  it('should return undefined if pools list is empty', () => {
    const sell: Balance.Amount = {
      quantity: '1',
      tokenId: 'tokenA',
    }

    expect(getBestBuyPool([], sell)).toBeUndefined()
  })
})
