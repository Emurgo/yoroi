import {Balance, Swap} from '@yoroi/types'

import {makeLimitOrder} from './makeLimitOrder'

describe('makeLimitOrder', () => {
  const sell = {
    quantity: '100' as Balance.Quantity,
    tokenId: 'tokenA',
  }
  const buy = {
    quantity: '200' as Balance.Quantity,
    tokenId: 'tokenB',
  }
  const pool: Swap.Pool = {
    tokenA: {quantity: '4500000', tokenId: 'tokenA'},
    tokenB: {quantity: '9000000', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.5',
    fee: '0.3',
    provider: 'minswap',
    batcherFee: {quantity: '1', tokenId: ''},
    deposit: {quantity: '1', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  }
  const address = '0xAddressHere'

  it('should create a limit order with the correct parameters', () => {
    const slippage = 10

    const expectedBuyQuantity = '180'

    const result = makeLimitOrder(sell, buy, pool, slippage, address)
    expect(result.selectedPool).toEqual(pool)
    expect(result.address).toEqual(address)
    expect(result.slippage).toEqual(slippage)
    expect(result.amounts.sell).toEqual(sell)
    expect(result.amounts.buy.tokenId).toEqual(buy.tokenId)
    expect(result.amounts.buy.quantity).toEqual(
      expectedBuyQuantity as Balance.Quantity,
    )
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
