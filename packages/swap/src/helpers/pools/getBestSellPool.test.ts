import {Balance} from '@yoroi/types'

import {getBestSellPool} from './getBestSellPool'
import {getSellAmount} from '../orders/getSellAmount'
import {mocks} from '../mocks'

describe('getBestSellPool', () => {
  it('should return pool with min possible tokens to sell', () => {
    const buy: Balance.Amount = {
      quantity: '1000000000',
      tokenId: 'tokenB',
    }

    const pools = mocks.mockedPools3
    const bestSellPool = getBestSellPool(pools, buy)

    if (bestSellPool) {
      expect(bestSellPool.provider).toBe('minswap')
      const sellAmount = getSellAmount(bestSellPool, buy)
      expect(sellAmount.quantity).toBe('69709507')
    } else {
      fail('bestSellPool is undefined')
    }
  })

  it('should return pool with min possible tokens to sell (opposite test)', () => {
    const buy: Balance.Amount = {
      quantity: '1000000000',
      tokenId: 'tokenA',
    }

    const pools = mocks.mockedPools4
    const bestSellPool = getBestSellPool(pools, buy)

    if (bestSellPool) {
      expect(bestSellPool.provider).toBe('minswap')
      const sellAmount = getSellAmount(bestSellPool, buy)
      expect(sellAmount.quantity).toBe('69709507')
    } else {
      fail('bestSellPool is undefined')
    }
  })

  it('should return undefined if buy amount is 0', () => {
    const sell: Balance.Amount = {
      quantity: '0',
      tokenId: 'tokenA',
    }

    expect(getBestSellPool([mocks.mockedPools4[0]!], sell)).toBeUndefined()
  })

  it('should return undefined if pools list is empty', () => {
    const sell: Balance.Amount = {
      quantity: '1',
      tokenId: 'tokenA',
    }

    expect(getBestSellPool([], sell)).toBeUndefined()
  })
})
