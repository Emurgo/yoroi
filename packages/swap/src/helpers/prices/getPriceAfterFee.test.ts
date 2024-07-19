import {Swap} from '@yoroi/types'
import {getPriceAfterFee} from './getPriceAfterFee'
import {BigNumber} from 'bignumber.js'

describe('getPriceAfterFee', () => {
  it('should calculate the correct price after fee when selling tokenA', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: 1200400368252n, tokenId: 'tokenA.'},
      tokenB: {quantity: 11364790709n, tokenId: 'tokenB.'},
      ptPriceTokenA: '0.03465765134',
      ptPriceTokenB: '3.81247293317',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      batcherFee: {quantity: 950000n, tokenId: '.'},
      deposit: {quantity: 1n, tokenId: '.'},
      poolId: '0',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
      },
    }
    const tokenId = 'tokenA.'
    const tokenAAmount = 10000000000n
    const tokenBAmount = 93613464n
    const result = getPriceAfterFee(pool, tokenAAmount, tokenBAmount, tokenId)
    const expected = new BigNumber('107.11505104205276356717')
    expect(result).toStrictEqual(expected)
  })

  it('should calculate the correct price after fee when selling tokenB', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: 143983812522n, tokenId: 'tokenA.'},
      tokenB: {quantity: 2050476716943n, tokenId: 'tokenB.'},
      ptPriceTokenA: '0.06954250577',
      ptPriceTokenB: '1',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      batcherFee: {quantity: 1900000n, tokenId: '.'},
      deposit: {quantity: 1n, tokenId: '.'},
      poolId: '0',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
      },
    }
    const tokenId = 'tokenA.'
    const tokenAAmount = 10000000000n
    const tokenBAmount = 696702612n
    const result = getPriceAfterFee(pool, tokenAAmount, tokenBAmount, tokenId)
    const expected = new BigNumber('14.39254173470077386167')
    expect(result).toStrictEqual(expected)
  })

  it('should return 0 when sell side is 0', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: 143983812522n, tokenId: 'tokenA.'},
      tokenB: {quantity: 2050476716943n, tokenId: 'tokenB.'},
      ptPriceTokenA: '0.06954250577',
      ptPriceTokenB: '1',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      batcherFee: {quantity: 1900000n, tokenId: '.'},
      deposit: {quantity: 1n, tokenId: '.'},
      poolId: '0',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
      },
    }
    const tokenAAmount = 0n
    const tokenBAmount = 93613464n
    const tokenId = 'tokenA.'
    const result = getPriceAfterFee(pool, tokenAAmount, tokenBAmount, tokenId)
    const expected = new BigNumber(0)
    expect(result).toStrictEqual(expected)
  })

  it('should return 0 when buy side is 0', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: 143983812522n, tokenId: 'tokenA.'},
      tokenB: {quantity: 2050476716943n, tokenId: 'tokenB.'},
      ptPriceTokenA: '0.06954250577',
      ptPriceTokenB: '1',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      batcherFee: {quantity: 1900000n, tokenId: '.'},
      deposit: {quantity: 1n, tokenId: '.'},
      poolId: '0',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
      },
    }
    const tokenAAmount = 10000000000n
    const tokenBAmount = 0n
    const tokenId = 'tokenA.'
    const result = getPriceAfterFee(pool, tokenAAmount, tokenBAmount, tokenId)
    const expected = new BigNumber(0)
    expect(result).toStrictEqual(expected)
  })

  // NOTE: it means that if the price is missing the fee wont consider the batcher fee
  it('should return not add the feeInSellTerm when pt sell side is 0', () => {
    const pool: Swap.Pool = {
      tokenA: {quantity: 143983812522n, tokenId: 'tokenA.'},
      tokenB: {quantity: 2050476716943n, tokenId: 'tokenB.'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '1',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      batcherFee: {quantity: 1900000n, tokenId: '.'},
      deposit: {quantity: 1n, tokenId: '.'},
      poolId: '0',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
      },
    }
    const tokenAAmount = 10000000000n
    const tokenBAmount = 1000n
    const tokenId = 'tokenA.'
    const result = getPriceAfterFee(pool, tokenAAmount, tokenBAmount, tokenId)
    const expected = new BigNumber(10000000)
    expect(result).toStrictEqual(expected)
  })
})
