import {Swap} from '@yoroi/types'
import {getPriceAfterFee} from './getPriceAfterFee'
import BigNumber from 'bignumber.js'

describe('getPriceAfterFee', () => {
  it('should calculate the correct price after fee when selling tokenA', () => {
    const pool = {
      tokenA: {quantity: '1200400368252', tokenId: 'tokenA'},
      tokenB: {quantity: '11364790709', tokenId: 'tokenB'},
      tokenAPriceLovelace: '0.03465765134',
      tokenBPriceLovelace: '3.81247293317',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      price: 2,
      batcherFee: {quantity: '950000', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    } as Swap.Pool
    const tokenId = 'tokenA'
    const tokenAAmount = '10000000000'
    const tokenBAmount = '93613464'
    const result = getPriceAfterFee(pool, tokenAAmount, tokenBAmount, tokenId)
    const expected = new BigNumber('107.11505104205276356717')
    expect(result).toStrictEqual(expected)
  })

  it('should calculate the correct price after fee when selling tokenB', () => {
    const pool = {
      tokenA: {quantity: '143983812522', tokenId: 'tokenA'},
      tokenB: {quantity: '2050476716943', tokenId: 'tokenB'},
      tokenAPriceLovelace: '0.06954250577',
      tokenBPriceLovelace: '1',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      price: 2,
      batcherFee: {quantity: '1900000', tokenId: ''},
      deposit: {quantity: '1', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    } as Swap.Pool
    const tokenId = 'tokenA'
    const tokenAAmount = '10000000000'
    const tokenBAmount = '696702612'
    const result = getPriceAfterFee(pool, tokenAAmount, tokenBAmount, tokenId)
    const expected = new BigNumber('14.39254173470077386167')
    expect(result).toStrictEqual(expected)
  })
})
