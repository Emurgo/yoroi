import {Swap} from '@yoroi/types'

import {makePossibleMarketOrder} from './makePossibleMarketOrder'

describe('makePossibleMarketOrder', () => {
  it('should create a possible market order with the best pool', () => {
    const sell = {
      quantity: '100' as const,
      tokenId: 'tokenA',
    }
    const buy = {
      quantity: '177' as const, // the expected buy quantity becsause makePossibleMarketOrder will ignore the buy quantity
      tokenId: 'tokenB',
    }
    const bestPool1: Swap.Pool = {
      tokenA: {quantity: '4500000', tokenId: 'tokenA'},
      tokenB: {quantity: '9000000', tokenId: 'tokenB'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
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

    const slippage = 10
    const address = '0xAddressHere'

    const result = makePossibleMarketOrder(
      sell,
      buy,
      bestPool1,
      slippage,
      address,
    )

    expect(result?.selectedPool).toEqual(bestPool1)
    expect(result?.slippage).toEqual(slippage)
    expect(result?.address).toEqual(address)
    expect(result?.amounts.buy.quantity).toEqual(buy.quantity)
  })
})
