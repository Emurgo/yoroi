import {Swap} from '@yoroi/types'
import {getPairPriceInPtTerms} from './getPairPriceInPtTerms'

describe('getPriceAfterFee', () => {
  it('should calculate the correct price based on sides and decimals', () => {
    // arrange
    const pool: Swap.Pool = {
      tokenA: {quantity: '1', tokenId: 'tokenA'},
      tokenB: {quantity: '2', tokenId: 'tokenB'},
      ptPriceTokenA: '0.03465765134',
      ptPriceTokenB: '3.81247293317',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      batcherFee: {quantity: '950000', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    // act
    const pricesAB = getPairPriceInPtTerms({
      amountA: pool.tokenA,
      decimalsA: 6,
      decimalsB: 0,
      ptPriceTokenA: '1',
      ptPriceTokenB: '8566.52826101672',
      sell: {
        quantity: '1',
        tokenId: 'tokenA',
      },
    })

    const pricesBA = getPairPriceInPtTerms({
      amountA: pool.tokenA,
      decimalsA: 6,
      decimalsB: 0,
      ptPriceTokenA: '1',
      ptPriceTokenB: '8566.52826101672',
      sell: {
        quantity: '1',
        tokenId: 'tokenB',
      },
    })

    // assert
    expect(pricesAB).toStrictEqual({
      ptPriceAB: '0.008566',
      ptPriceBA: '116.733403',
    })
    expect(pricesBA).toStrictEqual({
      ptPriceAB: '116.733403',
      ptPriceBA: '0.008566',
    })
  })

  it('should set decimals to 0 if undefined', () => {
    // arrange
    const pool: Swap.Pool = {
      tokenA: {quantity: '1', tokenId: 'tokenA'},
      tokenB: {quantity: '2', tokenId: 'tokenB'},
      ptPriceTokenA: '0.03465765134',
      ptPriceTokenB: '3.81247293317',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      batcherFee: {quantity: '950000', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    // act
    const pricesAB = getPairPriceInPtTerms({
      amountA: pool.tokenA,
      decimalsA: 6,
      decimalsB: 0,
      ptPriceTokenA: '0',
      ptPriceTokenB: '8566.52826101672',
      sell: {
        quantity: '1',
        tokenId: 'tokenA',
      },
    })

    // assert
    expect(pricesAB).toStrictEqual({
      ptPriceAB: '0',
      ptPriceBA: '0.000000',
    })
  })
})
