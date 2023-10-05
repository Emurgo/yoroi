import {Swap, Balance} from '@yoroi/types'

import {getBestSellPool} from './getBestSellPool'
import {getSellAmount} from './getSellAmount'

describe('getBestSellPool', () => {
  it('should return pool with min possible tokens to sell', () => {
    const pool1: Swap.Pool = {
      tokenA: {quantity: '529504614', tokenId: 'tokenA'},
      tokenB: {quantity: '7339640354', tokenId: 'tokenB'},
      tokenAPriceLovelace: '1',
      tokenBPriceLovelace: '0.06950020009',
      fee: '0.3', // 0.3%
      provider: 'muesliswap_v2',
      price: 0,
      batcherFee: {quantity: '950000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool2: Swap.Pool = {
      tokenA: {quantity: '143610201719', tokenId: 'tokenA'},
      tokenB: {quantity: '2055821866531', tokenId: 'tokenB'},
      tokenAPriceLovelace: '1',
      tokenBPriceLovelace: '0.06950020009',
      fee: '0.3', // 0.3%
      provider: 'vyfi',
      price: 0,
      batcherFee: {quantity: '1900000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool3: Swap.Pool = {
      tokenA: {quantity: '27337840212697', tokenId: 'tokenA'},
      tokenB: {quantity: '393349086430693', tokenId: 'tokenB'},
      tokenAPriceLovelace: '1',
      tokenBPriceLovelace: '0.06950020009',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      price: 0,
      batcherFee: {quantity: '2000000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool4: Swap.Pool = {
      tokenA: {quantity: '3400529909', tokenId: 'tokenA'},
      tokenB: {quantity: '49215467634', tokenId: 'tokenB'},
      tokenAPriceLovelace: '1',
      tokenBPriceLovelace: '0.06950020009',
      fee: '0.35', // 0.35%
      provider: 'wingriders',
      price: 0,
      batcherFee: {quantity: '2000000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool5: Swap.Pool = {
      tokenA: {quantity: '10178222382', tokenId: 'tokenA'},
      tokenB: {quantity: '145009426744', tokenId: 'tokenB'},
      tokenAPriceLovelace: '1',
      tokenBPriceLovelace: '0.06950020009',
      fee: '0.3', // 0.3%
      provider: 'sundaeswap',
      price: 0,
      batcherFee: {quantity: '2500000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool6: Swap.Pool = {
      tokenA: {quantity: '973669994', tokenId: 'tokenA'},
      tokenB: {quantity: '13710853133', tokenId: 'tokenB'},
      tokenAPriceLovelace: '1',
      tokenBPriceLovelace: '0.06950020009',
      fee: '0.05', // 0.05%
      provider: 'sundaeswap',
      price: 0,
      batcherFee: {quantity: '2500000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    } as Swap.Pool

    const buy: Balance.Amount = {
      quantity: '1000000000',
      tokenId: 'tokenB',
    }

    const pools = [pool1, pool2, pool3, pool4, pool5, pool6]
    const bestSellPool = getBestSellPool(pools, buy)
    expect(bestSellPool?.provider).toBe('minswap')

    if (bestSellPool) {
      const sellAmount = getSellAmount(bestSellPool, buy)
      expect(sellAmount.quantity).toBe('69709507')
    }
  })

  it('should return pool with min possible tokens to sell (opposite test)', () => {
    const pool1: Swap.Pool = {
      tokenB: {quantity: '529504614', tokenId: 'tokenB'},
      tokenA: {quantity: '7339640354', tokenId: 'tokenA'},
      tokenBPriceLovelace: '1',
      tokenAPriceLovelace: '0.06950020009',
      fee: '0.3', // 0.3%
      provider: 'muesliswap_v2',
      price: 0,
      batcherFee: {quantity: '950000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool2: Swap.Pool = {
      tokenB: {quantity: '143610201719', tokenId: 'tokenB'},
      tokenA: {quantity: '2055821866531', tokenId: 'tokenA'},
      tokenBPriceLovelace: '1',
      tokenAPriceLovelace: '0.06950020009',
      fee: '0.3', // 0.3%
      provider: 'vyfi',
      price: 0,
      batcherFee: {quantity: '1900000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool3: Swap.Pool = {
      tokenB: {quantity: '27337840212697', tokenId: 'tokenB'},
      tokenA: {quantity: '393349086430693', tokenId: 'tokenA'},
      tokenBPriceLovelace: '1',
      tokenAPriceLovelace: '0.06950020009',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      price: 0,
      batcherFee: {quantity: '2000000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool4: Swap.Pool = {
      tokenB: {quantity: '3400529909', tokenId: 'tokenB'},
      tokenA: {quantity: '49215467634', tokenId: 'tokenA'},
      tokenAPriceLovelace: '1',
      tokenBPriceLovelace: '0.06950020009',
      fee: '0.35', // 0.35%
      provider: 'wingriders',
      price: 0,
      batcherFee: {quantity: '2000000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool5: Swap.Pool = {
      tokenB: {quantity: '10178222382', tokenId: 'tokenB'},
      tokenA: {quantity: '145009426744', tokenId: 'tokenA'},
      tokenBPriceLovelace: '1',
      tokenAPriceLovelace: '0.06950020009',
      fee: '0.3', // 0.3%
      provider: 'sundaeswap',
      price: 0,
      batcherFee: {quantity: '2500000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool6: Swap.Pool = {
      tokenB: {quantity: '973669994', tokenId: 'tokenB'},
      tokenA: {quantity: '13710853133', tokenId: 'tokenA'},
      tokenAPriceLovelace: '1',
      tokenBPriceLovelace: '0.06950020009',
      fee: '0.05', // 0.05%
      provider: 'sundaeswap',
      price: 0,
      batcherFee: {quantity: '2500000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    } as Swap.Pool

    const buy: Balance.Amount = {
      quantity: '1000000000',
      tokenId: 'tokenA',
    }

    const pools = [pool1, pool2, pool3, pool4, pool5, pool6]
    const bestSellPool = getBestSellPool(pools, buy)
    expect(bestSellPool?.provider).toBe('minswap')

    if (bestSellPool) {
      const sellAmount = getSellAmount(bestSellPool, buy)
      expect(sellAmount.quantity).toBe('69709507')
    }
  })
})
