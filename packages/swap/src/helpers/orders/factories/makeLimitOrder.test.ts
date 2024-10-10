import {Portfolio, Swap} from '@yoroi/types'

import {makeLimitOrder} from './makeLimitOrder'
import {tokenInfoMocks} from '../../../tokenInfo.mocks'

describe('makeLimitOrder', () => {
  const sell: Portfolio.Token.Amount = {
    quantity: 100n,
    info: tokenInfoMocks.a,
  }
  const buy: Portfolio.Token.Amount = {
    quantity: 200n,
    info: tokenInfoMocks.b,
  }
  const pool: Swap.Pool = {
    tokenA: {quantity: 4500000n, tokenId: 'tokenA.'},
    tokenB: {quantity: 9000000n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.5',
    fee: '0.3',
    provider: 'minswap',
    batcherFee: {quantity: 1n, tokenId: '.'},
    deposit: {quantity: 1n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  }
  const address = '0xAddressHere'

  it('should create a limit order with the correct parameters', () => {
    const slippage = 10

    const expectedBuyQuantity = 180n

    const result = makeLimitOrder(sell, buy, pool, slippage, address)
    expect(result.selectedPool).toEqual(pool)
    expect(result.address).toEqual(address)
    expect(result.slippage).toEqual(slippage)
    expect(result.amounts.sell.tokenId).toEqual(sell.info.id)
    expect(result.amounts.sell.quantity).toEqual(sell.quantity)
    expect(result.amounts.buy.tokenId).toEqual(buy.info.id)
    expect(result.amounts.buy.quantity).toEqual(expectedBuyQuantity)
  })

  it('should throw an error if the slippage is invalid', () => {
    expect(() => makeLimitOrder(sell, buy, pool, -1, address)).toThrow(
      'Invalid slippage percentage',
    )
    expect(() => makeLimitOrder(sell, buy, pool, 101, address)).toThrow(
      'Invalid slippage percentage',
    )
  })
})
