import {Portfolio, Swap} from '@yoroi/types'

import {makePossibleMarketOrder} from './makePossibleMarketOrder'
import {tokenInfoMocks} from '../../../tokenInfo.mocks'

describe('makePossibleMarketOrder', () => {
  it('should create a possible market order with the best pool', () => {
    const sell: Portfolio.Token.Amount = {
      quantity: 100n,
      info: tokenInfoMocks.a,
    }
    const buy: Portfolio.Token.Amount = {
      quantity: 177n,
      info: tokenInfoMocks.b,
    }
    const bestPool1: Swap.Pool = {
      tokenA: {quantity: 4500000n, tokenId: 'tokenA.'},
      tokenB: {quantity: 9000000n, tokenId: 'tokenB.'},
      ptPriceTokenA: '0',
      ptPriceTokenB: '0',
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
