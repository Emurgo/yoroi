import {Swap} from '@yoroi/types'
import {tokenInfoMocks} from '../../tokenInfo.mocks'
import {mocks} from '../mocks'
import {getBestPoolCalculation} from './getBestPoolCalculation'

describe('getBestPoolCalculation', () => {
  it('should return the best pool calculation', () => {
    const bestCalculation = getBestPoolCalculation(
      mocks.mockedOrderCalculations1,
    )

    expect(bestCalculation?.pool.poolId).toBe('3')
  })

  it('should skip no supply pools', () => {
    const calculations: Array<Swap.OrderCalculation> = [
      {
        order: {
          side: 'buy',
          slippage: 10,
          orderType: 'market',
          amounts: {
            sell: {
              quantity: 0n,
              info: tokenInfoMocks.a,
            },
            buy: {
              quantity: 100000001n,
              info: tokenInfoMocks.b,
            },
          },
        },
        sides: {
          buy: {
            quantity: 100000001n,
            info: tokenInfoMocks.b,
          },
          sell: {
            quantity: 7157210n,
            info: tokenInfoMocks.a,
          },
        },
        cost: {
          ptTotalRequired: {
            quantity: 4500000n,
            info: tokenInfoMocks.pt,
          },
          batcherFee: {
            quantity: 2500000n,
            info: tokenInfoMocks.pt,
          },
          deposit: {
            quantity: 2000000n,
            info: tokenInfoMocks.pt,
          },
          frontendFeeInfo: {
            fee: {
              info: tokenInfoMocks.pt,
              quantity: 0n,
            },
          },
          liquidityFee: {
            info: tokenInfoMocks.a,
            quantity: 3579n,
          },
        },
        buyAmountWithSlippage: {
          quantity: 90000000n,
          info: tokenInfoMocks.b,
        },
        hasSupply: false,
        prices: {
          base: '0.07101454479564951518',
          market: '0.07101454479564951518',
          actualPrice: '0',
          withSlippage: '0.07952455555555555556',
          withFees: '0.09657209903427900966',
          withFeesAndSlippage: '0.10730233333333333333',
          difference: '35.989182655713084861',
          priceImpact: '0',
        },
        pool: {
          tokenA: {
            quantity: 973669994n,
            tokenId: tokenInfoMocks.a.id,
          },
          tokenB: {
            quantity: 13710853133n,
            tokenId: tokenInfoMocks.b.id,
          },
          ptPriceTokenA: '1',
          ptPriceTokenB: '0.0695404765',
          fee: '0.05',
          provider: 'sundaeswap',
          batcherFee: {
            quantity: 2500000n,
            tokenId: '.',
          },
          deposit: {
            quantity: 2000000n,
            tokenId: '.',
          },
          poolId: '6',
          lpToken: {
            quantity: 0n,
            tokenId: '0.',
          },
        },
      },
    ]
    const bestCalculation = getBestPoolCalculation(calculations)

    expect(bestCalculation).toBeUndefined()
  })
})
