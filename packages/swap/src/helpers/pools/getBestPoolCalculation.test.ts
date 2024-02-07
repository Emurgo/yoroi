import {mocks} from '../mocks'
import {SwapOrderCalculation} from '../../translators/reactjs/state/state'
import {getBestPoolCalculation} from './getBestPoolCalculation'

describe('getBestPoolCalculation', () => {
  it('should return the best pool calculation', () => {
    const bestCalculation = getBestPoolCalculation(
      mocks.mockedOrderCalculations1,
    )

    expect(bestCalculation?.pool.poolId).toBe('3')
  })

  it('should skip no supply pools', () => {
    const calculations: ReadonlyArray<SwapOrderCalculation> = [
      {
        order: {
          side: 'buy',
          slippage: 10,
          orderType: 'market',
          amounts: {
            sell: {
              quantity: '0',
              tokenId: 'tokenA',
            },
            buy: {
              quantity: '100000001',
              tokenId: 'tokenB',
            },
          },
        },
        sides: {
          buy: {
            quantity: '100000001',
            tokenId: 'tokenB',
          },
          sell: {
            quantity: '7157210',
            tokenId: 'tokenA',
          },
        },
        cost: {
          ptTotalRequired: {
            quantity: '4500000',
            tokenId: '',
          },
          batcherFee: {
            quantity: '2500000',
            tokenId: '',
          },
          deposit: {
            quantity: '2000000',
            tokenId: '',
          },
          frontendFeeInfo: {
            fee: {
              tokenId: '',
              quantity: '0',
            },
          },
          liquidityFee: {
            tokenId: 'tokenA',
            quantity: '3579',
          },
        },
        buyAmountWithSlippage: {
          quantity: '90000000',
          tokenId: 'tokenB',
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
            quantity: '973669994',
            tokenId: 'tokenA',
          },
          tokenB: {
            quantity: '13710853133',
            tokenId: 'tokenB',
          },
          ptPriceTokenA: '1',
          ptPriceTokenB: '0.0695404765',
          fee: '0.05',
          provider: 'sundaeswap',
          batcherFee: {
            quantity: '2500000',
            tokenId: '',
          },
          deposit: {
            quantity: '2000000',
            tokenId: '',
          },
          poolId: '6',
          lpToken: {
            quantity: '0',
            tokenId: '0',
          },
        },
      },
    ]
    const bestCalculation = getBestPoolCalculation(calculations)

    expect(bestCalculation).toBeUndefined()
  })
})
