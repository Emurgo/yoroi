import {Swap} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'

import {getMarketPrice} from './getMarketPrice'

describe('getMarketPrice', () => {
  it('should calculate the correct market price when selling tokenA', () => {
    const pool = {
      tokenA: {quantity: 4500000n, tokenId: 'tokenA.'},
      tokenB: {quantity: 9000000n, tokenId: 'tokenB.'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      price: 2,
      batcherFee: {quantity: 1n, tokenId: '.'},
      deposit: {quantity: 1n, tokenId: '.'},
      poolId: '0',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
      },
    } as Swap.Pool
    const result = getMarketPrice(pool, 'tokenA.')
    expect(result).toEqual(new BigNumber(0.5))
  })

  it('should calculate the correct market price when selling tokenB', () => {
    const pool = {
      tokenA: {quantity: 4500000n, tokenId: 'tokenA.'},
      tokenB: {quantity: 9000000n, tokenId: 'tokenB.'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      price: 2,
      batcherFee: {quantity: 1n, tokenId: '.'},
      deposit: {quantity: 1n, tokenId: '.'},
      poolId: '0',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
      },
    } as Swap.Pool
    const result = getMarketPrice(pool, 'tokenB.')
    expect(result).toEqual(new BigNumber(2))
  })
})
