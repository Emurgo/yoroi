import {Swap} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'

import {getPairPriceInPtTerms} from './getPairPriceInPtTerms'
import {tokenInfoMocks} from '../../tokenInfo.mocks'

describe('getPriceInPtTerms', () => {
  it('should calculate the correct price based on sides and decimals', () => {
    // arrange
    const pool: Swap.Pool = {
      tokenA: {quantity: 1n, tokenId: 'tokenA.'},
      tokenB: {quantity: 2n, tokenId: 'tokenB.'},
      ptPriceTokenA: '0.03465765134',
      ptPriceTokenB: '3.81247293317',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      batcherFee: {quantity: 950000n, tokenId: '.'},
      deposit: {quantity: 1n, tokenId: '.'},
      poolId: '0',
      lpToken: {
        quantity: 0n,
        tokenId: '0.,',
      },
    }

    // act
    const pricesAB = getPairPriceInPtTerms({
      buy: {
        info: {
          ...tokenInfoMocks.b,
          decimals: 4,
        },
        quantity: pool.tokenA.quantity,
      },
      pool,
      sell: {
        quantity: 1n,
        info: tokenInfoMocks.a,
      },
    })

    const pricesBA = getPairPriceInPtTerms({
      buy: {
        info: tokenInfoMocks.a,
        quantity: pool.tokenA.quantity,
      },
      pool,
      sell: {
        quantity: 1n,
        info: {
          ...tokenInfoMocks.b,
          decimals: 4,
        },
      },
    })

    // assert
    expect(pricesAB).toStrictEqual({
      ptPriceAB: new BigNumber('11000.378807463645053797'),
      ptPriceBA: new BigNumber('0.00009090596037670177'),
    })
    expect(pricesBA).toStrictEqual({
      ptPriceAB: new BigNumber('0.909059603767017713'),
      ptPriceBA: new BigNumber('1.1000378807463645053797'),
    })
  })

  it('should set decimals to 0 if undefined', () => {
    // arrange
    const pool: Swap.Pool = {
      tokenA: {quantity: 1n, tokenId: 'tokenA.'},
      tokenB: {quantity: 2n, tokenId: 'tokenB.'},
      ptPriceTokenA: '0.0',
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

    // act
    const pricesAB = getPairPriceInPtTerms({
      buy: {
        info: {...tokenInfoMocks.b, decimals: 0},
        quantity: pool.tokenA.quantity,
      },
      pool,
      sell: {
        quantity: 1n,
        info: tokenInfoMocks.a,
      },
    })

    // assert
    expect(pricesAB).toStrictEqual({
      ptPriceAB: new BigNumber(0),
      ptPriceBA: new BigNumber(0),
    })
  })
})
