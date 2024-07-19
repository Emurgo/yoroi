import {tokenInfoMocks} from '@yoroi/portfolio'
import {Portfolio, Swap} from '@yoroi/types'

import {YoroiEntry} from '../../../yoroi-wallets/types/yoroi'
import {asQuantity} from '../../../yoroi-wallets/utils/utils'
import {createOrderEntry, makePossibleFrontendFeeEntry} from './entries'

describe('makePossibleFrontendFeeEntry', () => {
  it('return null if there is no address to deposit the frontend fee configured', () => {
    // arrange
    const fee: Portfolio.Token.Amount = {
      quantity: 1n,
      info: tokenInfoMocks.primaryETH,
    }
    const wallet = undefined

    // act
    const possibleFeeEntry = makePossibleFrontendFeeEntry(fee, wallet)

    // assert
    expect(possibleFeeEntry).toBeNull()
  })

  it('return null if there is no frontend fee in the calculation', () => {
    // arrange
    const fee: Portfolio.Token.Amount = {
      quantity: 0n,
      info: tokenInfoMocks.primaryETH,
    }
    const wallet = 'deposit.frontend.fee.wallet.address'

    // act
    const possibleFeeEntry = makePossibleFrontendFeeEntry(fee, wallet)

    // assert
    expect(possibleFeeEntry).toBeNull()
  })

  it('return the frontend fee entry when its present and also has a address to deposit it configured', () => {
    // arrange
    const fee: Portfolio.Token.Amount = {
      quantity: 1n,
      info: tokenInfoMocks.primaryETH,
    }
    const wallet = 'deposit.frontend.fee.wallet.address'
    const expectedEntry: YoroiEntry = {
      address: wallet,
      amounts: {
        ['']: asQuantity(fee.quantity.toString()),
      },
    } as const

    // act
    const possibleFeeEntry = makePossibleFrontendFeeEntry(fee, wallet)

    // assert
    expect(possibleFeeEntry).toEqual(expectedEntry)
  })
})

describe('createOrderEntry', () => {
  const selectedPool: Swap.CreateOrderData['selectedPool'] = {
    deposit: {
      quantity: 2000000n,
      tokenId: 'token2.Id',
    },
    batcherFee: {
      quantity: 1000000n,
      tokenId: 'token2.Id',
    },
    // below are the values that are not used in the helper
    fee: '1',
    lpToken: {
      quantity: 1n,
      tokenId: 'irrelevant.lpToken',
    },
    poolId: 'irrelevant.poolId',
    provider: 'minswap',
    ptPriceTokenA: '1',
    ptPriceTokenB: '1',
    tokenA: {
      quantity: 1n,
      tokenId: 'irrelevant.tokenA',
    },
    tokenB: {
      quantity: 1n,
      tokenId: 'irrelevant.tokenB',
    },
  }
  const address = 'aggregator.address'
  const datum: YoroiEntry['datum'] = {data: 'cbor'}

  it('should create a YoroiEntry with one amount when selling the primary token', () => {
    // arrange
    const amounts: Swap.CreateOrderData['amounts'] = {
      sell: {
        quantity: 1000000n,
        tokenId: tokenInfoMocks.primaryETH.id,
      },
      buy: {
        quantity: 5n,
        tokenId: 'irrelevant.buy',
      },
    }

    // act
    const orderEntry = createOrderEntry(amounts, selectedPool, address, tokenInfoMocks.primaryETH.id, datum)

    // assert
    expect(orderEntry).toEqual({
      address: address,
      amounts: {
        ['']: '4000000',
      },
      datum: datum,
    })
  })

  it('should create a YoroiEntry with two amounts when selling a non-primary token', () => {
    // arrange
    const amounts: Swap.CreateOrderData['amounts'] = {
      sell: {
        quantity: 1n,
        tokenId: 'nonPrimaryToken.Id',
      },
      buy: {
        quantity: 5n,
        tokenId: 'irrelevant.buy',
      },
    }
    // act
    const orderEntry = createOrderEntry(amounts, selectedPool, address, tokenInfoMocks.primaryETH.id, datum)

    // assert
    expect(orderEntry).toEqual({
      address: address,
      amounts: {
        ['']: '3000000',
        [amounts.sell.tokenId]: asQuantity(amounts.sell.quantity.toString()),
      },
      datum: datum,
    })
  })
})
