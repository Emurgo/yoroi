import {Swap, Balance} from '@yoroi/types'

import {getBestBuyPool} from './getBestBuyPool'
import {getBuyAmount} from './getBuyAmount'

describe('getBestBuyPool', () => {
  it('should return pool with maximin possible tokens to buy', () => {
    const pool1: Swap.Pool = {
      tokenA: {quantity: '529504614', tokenId: 'tokenA'},
      tokenB: {quantity: '7339640354', tokenId: 'tokenB'},
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3', // 0.3%
      provider: 'muesliswap_v2',
      price: 0,
      batcherFee: {quantity: '950000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool2: Swap.Pool = {
      tokenA: {quantity: '143610201719', tokenId: 'tokenA'},
      tokenB: {quantity: '2055821866531', tokenId: 'tokenB'},
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3', // 0.3%
      provider: 'vyfi',
      price: 0,
      batcherFee: {quantity: '1900000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool3: Swap.Pool = {
      tokenA: {quantity: '27344918300893', tokenId: 'tokenA'},
      tokenB: {quantity: '393223050468514', tokenId: 'tokenB'},
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      price: 0,
      batcherFee: {quantity: '2000000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool4: Swap.Pool = {
      tokenA: {quantity: '3400529909', tokenId: 'tokenA'},
      tokenB: {quantity: '49215467634', tokenId: 'tokenB'},
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.35', // 0.35%
      provider: 'wingriders',
      price: 0,
      batcherFee: {quantity: '2000000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool5: Swap.Pool = {
      tokenA: {quantity: '10178222382', tokenId: 'tokenA'},
      tokenB: {quantity: '145009426744', tokenId: 'tokenB'},
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3', // 0.3%
      provider: 'sundaeswap',
      price: 0,
      batcherFee: {quantity: '2500000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool6: Swap.Pool = {
      tokenA: {quantity: '973669994', tokenId: 'tokenA'},
      tokenB: {quantity: '13710853133', tokenId: 'tokenB'},
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.05', // 0.05%
      provider: 'sundaeswap',
      price: 0,
      batcherFee: {quantity: '2500000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    } as Swap.Pool

    const sell: Balance.Amount = {
      quantity: '10000000000',
      tokenId: 'tokenB',
    }

    const pools = [pool1, pool2, pool3, pool4, pool5, pool6]
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
    const pool1: Swap.Pool = {
      tokenA: {quantity: '529504614', tokenId: 'tokenA'},
      tokenB: {quantity: '7339640354', tokenId: 'tokenB'},
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3', // 0.3%
      provider: 'muesliswap_v2',
      price: 0,
      batcherFee: {quantity: '950000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool2: Swap.Pool = {
      tokenA: {quantity: '143610201719', tokenId: 'tokenA'},
      tokenB: {quantity: '2055821866531', tokenId: 'tokenB'},
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3', // 0.3%
      provider: 'vyfi',
      price: 0,
      batcherFee: {quantity: '1900000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool3: Swap.Pool = {
      tokenA: {quantity: '27344918300893', tokenId: 'tokenA'},
      tokenB: {quantity: '393223050468514', tokenId: 'tokenB'},
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      price: 0,
      batcherFee: {quantity: '2000000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool4: Swap.Pool = {
      tokenA: {quantity: '3400529909', tokenId: 'tokenA'},
      tokenB: {quantity: '49215467634', tokenId: 'tokenB'},
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.35', // 0.35%
      provider: 'wingriders',
      price: 0,
      batcherFee: {quantity: '2000000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool5: Swap.Pool = {
      tokenA: {quantity: '10178222382', tokenId: 'tokenA'},
      tokenB: {quantity: '145009426744', tokenId: 'tokenB'},
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3', // 0.3%
      provider: 'sundaeswap',
      price: 0,
      batcherFee: {quantity: '2500000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool6: Swap.Pool = {
      tokenA: {quantity: '973669994', tokenId: 'tokenA'},
      tokenB: {quantity: '13710853133', tokenId: 'tokenB'},
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.05', // 0.05%
      provider: 'sundaeswap',
      price: 0,
      batcherFee: {quantity: '2500000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    } as Swap.Pool

    const sell: Balance.Amount = {
      quantity: '1000000000',
      tokenId: 'tokenA',
    }

    const pools = [pool1, pool2, pool3, pool4, pool5, pool6]
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
    const pool1: Swap.Pool = {
      tokenA: {quantity: '529504614', tokenId: 'tokenA'},
      tokenB: {quantity: '7339640354', tokenId: 'tokenB'},
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3', // 0.3%
      provider: 'muesliswap_v2',
      price: 0,
      batcherFee: {quantity: '950000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const sell: Balance.Amount = {
      quantity: '0',
      tokenId: 'tokenA',
    }

    expect(getBestBuyPool([pool1], sell)).toBeUndefined()
  })

  it('should return undefined if pools list is empty', () => {
    const sell: Balance.Amount = {
      quantity: '1',
      tokenId: 'tokenA',
    }

    expect(getBestBuyPool([], sell)).toBeUndefined()
  })
})
