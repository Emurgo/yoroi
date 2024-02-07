import {Balance, Swap} from '@yoroi/types'
import {AppApi} from '@yoroi/api'

import {makeOrderCalculations} from './makeOrderCalculations'
import {mocks} from '../../mocks'
import {SwapOrderCalculation} from '../../../translators/reactjs/state/state'

describe('makeOrderCalculations', () => {
  const frontendFeeTiers = AppApi.mockGetFrontendFees.withFees.muesliswap!

  it('should calculate all fees and amounts correctly (case 1, sell A)', () => {
    const pool = mocks.mockedPools5[0] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '10000000000',
        tokenId: 'tokenA',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenB',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'sell',
      frontendFeeTiers,
    })

    expect(calculations[0]).toStrictEqual({
      order: {
        side: 'sell',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '10000000000',
            tokenId: 'tokenA',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenB',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '10000000000',
          tokenId: 'tokenA',
        },
        buy: {
          quantity: '148894355282',
          tokenId: 'tokenB',
        },
      },
      cost: {
        batcherFee: {
          quantity: '2000000',
          tokenId: '',
        },
        deposit: {
          quantity: '2000000',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: {
            fixedFee: '1000000',
            primaryTokenValueThreshold: '100000000',
            secondaryTokenBalanceThreshold: '0',
            variableFeeMultiplier: 0.0005,
          },
          fee: {
            quantity: '6000000',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '30000000',
          tokenId: 'tokenA',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '10000000',
        },
      },
      buyAmountWithSlippage: {
        quantity: '148894355282',
        tokenId: 'tokenB',
      },
      ptTotalValueSpent: {
        quantity: '10008000000',
        tokenId: '',
      },
      hasSupply: true,
      prices: {
        base: '0.06693552899045170664',
        market: '0.06693552899045170664',
        actualPrice: '0.06716171329034198007',
        withSlippage: '0.06716171329034198007',
        withFees: '0.06721544266097425366',
        withFeesAndSlippage: '0.06721544266097425366',
        difference: '0.418183996965910966',
        priceImpact: '0.33791366603308449',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 2, sell B, reversed case 1) ', () => {
    const pool = mocks.mockedPools5[1] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '10000000000',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'sell',
      frontendFeeTiers,
    })
    const calculation = calculations[0] as SwapOrderCalculation
    expect(calculation).toStrictEqual({
      order: {
        side: 'sell',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '10000000000',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '10000000000',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '148894355282',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '2000000',
          tokenId: '',
        },
        deposit: {
          quantity: '2000000',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: {
            fixedFee: '1000000',
            primaryTokenValueThreshold: '100000000',
            secondaryTokenBalanceThreshold: '0',
            variableFeeMultiplier: 0.0005,
          },
          fee: {
            quantity: '6000000',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '30000000',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '10000000',
        },
      },
      buyAmountWithSlippage: {
        quantity: '148894355282',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: {
        quantity: '10008000000',
        tokenId: '',
      },
      hasSupply: true,
      prices: {
        base: '0.06693552899045170664',
        market: '0.06693552899045170664',
        actualPrice: '0.06716171329034198007',
        withSlippage: '0.06716171329034198007',
        withFees: '0.06721544266097425366',
        withFeesAndSlippage: '0.06721544266097425366',
        difference: '0.418183996965910966',
        priceImpact: '0.33791366603308449',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 3, buy B)', () => {
    const pool = mocks.mockedPools5[0] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '0',
        tokenId: 'tokenA',
      } as Balance.Amount,
      buy: {
        quantity: '148894355268',
        tokenId: 'tokenB',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'buy',
      frontendFeeTiers,
    })
    const calculation = calculations[0] as SwapOrderCalculation

    expect(calculation).toStrictEqual({
      order: {
        side: 'buy',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '0',
            tokenId: 'tokenA',
          },
          buy: {
            quantity: '148894355268',
            tokenId: 'tokenB',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '10000000000',
          tokenId: 'tokenA',
        },
        buy: {
          quantity: '148894355268',
          tokenId: 'tokenB',
        },
      },
      cost: {
        batcherFee: {
          quantity: '2000000',
          tokenId: '',
        },
        deposit: {
          quantity: '2000000',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: {
            fixedFee: '1000000',
            primaryTokenValueThreshold: '100000000',
            secondaryTokenBalanceThreshold: '0',
            variableFeeMultiplier: 0.0005,
          },
          fee: {
            quantity: '6000000',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '30000000',
          tokenId: 'tokenA',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '10000000',
        },
      },
      buyAmountWithSlippage: {
        quantity: '148894355268',
        tokenId: 'tokenB',
      },
      ptTotalValueSpent: {
        quantity: '10008000000',
        tokenId: '',
      },
      hasSupply: true,
      prices: {
        base: '0.06693552899045170664',
        market: '0.06693552899045170664',
        actualPrice: '0.0671617132966569541',
        withSlippage: '0.0671617132966569541',
        withFees: '0.06721544266729427966',
        withFeesAndSlippage: '0.06721544266729427966',
        difference: '0.418184006407871156',
        priceImpact: '0.337913675467497163',
      },
      pool: pool,
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 4, buy A, reversed case 3) ', () => {
    const pool = mocks.mockedPools5[1] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '0',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '148894355268',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'buy',
      frontendFeeTiers,
    })
    const calculation = calculations[0] as SwapOrderCalculation

    expect(calculation).toStrictEqual({
      order: {
        side: 'buy',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '0',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '148894355268',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '10000000000',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '148894355268',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '2000000',
          tokenId: '',
        },
        deposit: {
          quantity: '2000000',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: {
            fixedFee: '1000000',
            primaryTokenValueThreshold: '100000000',
            secondaryTokenBalanceThreshold: '0',
            variableFeeMultiplier: 0.0005,
          },
          fee: {
            quantity: '6000000',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '30000000',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '10000000',
        },
      },
      buyAmountWithSlippage: {
        quantity: '148894355268',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: {
        quantity: '10008000000',
        tokenId: '',
      },
      hasSupply: true,
      prices: {
        base: '0.06693552899045170664',
        market: '0.06693552899045170664',
        actualPrice: '0.0671617132966569541',
        withSlippage: '0.0671617132966569541',
        withFees: '0.06721544266729427966',
        withFeesAndSlippage: '0.06721544266729427966',
        difference: '0.418184006407871156',
        priceImpact: '0.337913675467497163',
      },
      pool: pool,
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 5, with slippage)', () => {
    const pool = mocks.mockedPools5[2] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '100',
        tokenId: 'tokenA',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenB',
      } as Balance.Amount,
    }

    const slippage = 50
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'sell',
      frontendFeeTiers,
    })

    expect(calculations[0]).toStrictEqual({
      order: {
        side: 'sell',
        slippage: 50,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '100',
            tokenId: 'tokenA',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenB',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '100',
          tokenId: 'tokenA',
        },
        buy: {
          quantity: '100',
          tokenId: 'tokenB',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenA',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '50',
        tokenId: 'tokenB',
      },
      ptTotalValueSpent: {
        quantity: '100',
        tokenId: '',
      },

      hasSupply: true,
      prices: {
        base: '0.99009900990099009901',
        market: '0.99009900990099009901',
        actualPrice: '1',
        withSlippage: '2',
        withFees: '1',
        withFeesAndSlippage: '2',
        difference: '1',
        priceImpact: '1',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 6, zero supply)', () => {
    const pool = mocks.mockedPools5[3] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '100',
        tokenId: 'tokenA',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenB',
      } as Balance.Amount,
    }

    const slippage = 50
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'sell',
      frontendFeeTiers,
    })
    expect(calculations[0]).toStrictEqual({
      order: {
        side: 'sell',
        slippage: 50,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '100',
            tokenId: 'tokenA',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenB',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '100',
          tokenId: 'tokenA',
        },
        buy: {
          quantity: '0',
          tokenId: 'tokenB',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenA',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '0',
        tokenId: 'tokenB',
      },
      ptTotalValueSpent: {
        quantity: '100',
        tokenId: '',
      },
      hasSupply: false,
      prices: {
        base: '0',
        market: '0',
        actualPrice: '0',
        withSlippage: '0',
        withFees: '0',
        withFeesAndSlippage: '0',
        difference: '0',
        priceImpact: '0',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 7, sell A, not enough supply)', () => {
    const pool = mocks.mockedPools5[4] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '100',
        tokenId: 'tokenA',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenB',
      } as Balance.Amount,
    }

    const slippage = 50
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'sell',
      frontendFeeTiers,
    })

    expect(calculations[0]).toStrictEqual({
      order: {
        side: 'sell',
        slippage: 50,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '100',
            tokenId: 'tokenA',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenB',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '100',
          tokenId: 'tokenA',
        },
        buy: {
          quantity: '0',
          tokenId: 'tokenB',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenA',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '0',
        tokenId: 'tokenB',
      },
      ptTotalValueSpent: {
        quantity: '100',
        tokenId: '',
      },
      hasSupply: true,
      prices: {
        base: '1',
        market: '1',
        actualPrice: '0',
        withSlippage: '0',
        withFees: '0',
        withFeesAndSlippage: '0',
        difference: '-100',
        priceImpact: '-100',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 8, buy A, not enough supply)', () => {
    const pool = mocks.mockedPools5[4] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '0',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '100',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'buy',
      frontendFeeTiers,
    })

    expect(calculations[0]).toStrictEqual({
      order: {
        side: 'buy',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '0',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '100',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '1',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '100',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '100',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: {
        quantity: '1',
        tokenId: '',
      },
      hasSupply: false,
      prices: {
        base: '1',
        market: '1',
        actualPrice: '0.01',
        withSlippage: '0.01',
        withFees: '0.01',
        withFeesAndSlippage: '0.01',
        difference: '-99',
        priceImpact: '-99',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 9, sell A, A supply is zero)', () => {
    const pool = mocks.mockedPools5[5] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '100',
        tokenId: 'tokenA',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenB',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'sell',
      frontendFeeTiers,
    })

    expect(calculations[0]).toStrictEqual({
      order: {
        side: 'sell',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '100',
            tokenId: 'tokenA',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenB',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '100',
          tokenId: 'tokenA',
        },
        buy: {
          quantity: '1',
          tokenId: 'tokenB',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenA',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '1',
        tokenId: 'tokenB',
      },
      ptTotalValueSpent: {
        quantity: '100',
        tokenId: '',
      },
      hasSupply: true,
      prices: {
        base: '0',
        market: '0',
        actualPrice: '100',
        withSlippage: '100',
        withFees: '100',
        withFeesAndSlippage: '100',
        difference: '0',
        priceImpact: '0',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 10, sell A, B supply is zero)', () => {
    const pool = mocks.mockedPools5[6] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '100',
        tokenId: 'tokenA',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenB',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'sell',
      frontendFeeTiers,
    })

    expect(calculations[0]).toStrictEqual({
      order: {
        side: 'sell',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '100',
            tokenId: 'tokenA',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenB',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '100',
          tokenId: 'tokenA',
        },
        buy: {
          quantity: '0',
          tokenId: 'tokenB',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenA',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '0',
        tokenId: 'tokenB',
      },
      ptTotalValueSpent: {
        quantity: '100',
        tokenId: '',
      },
      hasSupply: false,
      prices: {
        base: '0',
        market: '0',
        actualPrice: '0',
        withSlippage: '0',
        withFees: '0',
        withFeesAndSlippage: '0',
        difference: '0',
        priceImpact: '0',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 11, buy A, A supply is zero)', () => {
    const pool = mocks.mockedPools5[5] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '0',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '100',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'buy',
      frontendFeeTiers,
    })

    expect(calculations[0]).toStrictEqual({
      order: {
        side: 'buy',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '0',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '100',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '0',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '100',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '100',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: undefined,
      hasSupply: false,
      prices: {
        base: '0',
        market: '0',
        actualPrice: '0',
        withSlippage: '0',
        withFees: '0',
        withFeesAndSlippage: '0',
        difference: '0',
        priceImpact: '0',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 12, buy A, B supply is zero)', () => {
    const pool = mocks.mockedPools5[6] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '0',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '100',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'buy',
      frontendFeeTiers,
    })

    expect(calculations[0]).toStrictEqual({
      order: {
        side: 'buy',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '0',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '100',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '1',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '100',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '100',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: {
        quantity: '1',
        tokenId: '',
      },
      hasSupply: false,
      prices: {
        base: '0',
        market: '0',
        actualPrice: '0.01',
        withSlippage: '0.01',
        withFees: '0.01',
        withFeesAndSlippage: '0.01',
        difference: '0',
        priceImpact: '0',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 13, sell B, B supply is zero)', () => {
    const pool = mocks.mockedPools5[6] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '100',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'sell',
      frontendFeeTiers,
    })

    expect(calculations[0]).toStrictEqual({
      order: {
        side: 'sell',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '100',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '100',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '1',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '1',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: {
        quantity: '100',
        tokenId: '',
      },
      hasSupply: true,
      prices: {
        base: '0',
        market: '0',
        actualPrice: '100',
        withSlippage: '100',
        withFees: '100',
        withFeesAndSlippage: '100',
        difference: '0',
        priceImpact: '0',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 14, sell B, A supply is zero)', () => {
    const pool = mocks.mockedPools5[5] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '100',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'sell',
      frontendFeeTiers,
    })

    expect(calculations[0]).toStrictEqual({
      order: {
        side: 'sell',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '100',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '100',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '0',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '0',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: {
        quantity: '100',
        tokenId: '',
      },
      hasSupply: false,
      prices: {
        base: '0',
        market: '0',
        actualPrice: '0',
        withSlippage: '0',
        withFees: '0',
        withFeesAndSlippage: '0',
        difference: '0',
        priceImpact: '0',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 15, buy B, B supply is zero)', () => {
    const pool = mocks.mockedPools5[6] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '0',
        tokenId: 'tokenA',
      } as Balance.Amount,
      buy: {
        quantity: '100',
        tokenId: 'tokenB',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'buy',
      frontendFeeTiers,
    })

    expect(calculations[0]).toStrictEqual({
      order: {
        side: 'buy',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '0',
            tokenId: 'tokenA',
          },
          buy: {
            quantity: '100',
            tokenId: 'tokenB',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '0',
          tokenId: 'tokenA',
        },
        buy: {
          quantity: '100',
          tokenId: 'tokenB',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenA',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '100',
        tokenId: 'tokenB',
      },
      ptTotalValueSpent: undefined,
      hasSupply: false,
      prices: {
        base: '0',
        market: '0',
        actualPrice: '0',
        withSlippage: '0',
        withFees: '0',
        withFeesAndSlippage: '0',
        difference: '0',
        priceImpact: '0',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 16, buy B, A supply is zero)', () => {
    const pool = mocks.mockedPools5[5] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '0',
        tokenId: 'tokenA',
      } as Balance.Amount,
      buy: {
        quantity: '100',
        tokenId: 'tokenB',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'buy',
      frontendFeeTiers,
    })

    expect(calculations[0]).toStrictEqual({
      order: {
        side: 'buy',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '0',
            tokenId: 'tokenA',
          },
          buy: {
            quantity: '100',
            tokenId: 'tokenB',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '1',
          tokenId: 'tokenA',
        },
        buy: {
          quantity: '100',
          tokenId: 'tokenB',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenA',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '100',
        tokenId: 'tokenB',
      },
      ptTotalValueSpent: {
        quantity: '1',
        tokenId: '',
      },
      hasSupply: false,
      prices: {
        base: '0',
        market: '0',
        actualPrice: '0.01',
        withSlippage: '0.01',
        withFees: '0.01',
        withFeesAndSlippage: '0.01',
        difference: '0',
        priceImpact: '0',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 17, buy A, limit price)', () => {
    const pool = mocks.mockedPools5[7] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '0',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '100',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'limit',
      amounts: amounts,
      limitPrice: '2',
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'buy',
      frontendFeeTiers,
    })
    const calculation = calculations[0] as SwapOrderCalculation
    expect(calculation).toStrictEqual({
      order: {
        side: 'buy',
        slippage: 0,
        orderType: 'limit',
        limitPrice: '2',
        amounts: {
          sell: {
            quantity: '0',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '100',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '200',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '100',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '100',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: {
        quantity: '200',
        tokenId: '',
      },
      hasSupply: true,
      prices: {
        base: '2',
        market: '1',
        actualPrice: '2',
        withSlippage: '2',
        withFees: '2',
        withFeesAndSlippage: '2',
        difference: '0',
        priceImpact: '100',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 18, sell A, limit price)', () => {
    const pool = mocks.mockedPools5[7] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '200',
        tokenId: 'tokenA',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenB',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'limit',
      amounts: amounts,
      limitPrice: '2',
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'sell',
      frontendFeeTiers,
    })
    const calculation = calculations[0] as SwapOrderCalculation
    expect(calculation).toStrictEqual({
      order: {
        side: 'sell',
        slippage: 0,
        orderType: 'limit',
        limitPrice: '2',
        amounts: {
          sell: {
            quantity: '200',
            tokenId: 'tokenA',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenB',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '200',
          tokenId: 'tokenA',
        },
        buy: {
          quantity: '100',
          tokenId: 'tokenB',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenA',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '100',
        tokenId: 'tokenB',
      },
      ptTotalValueSpent: {
        quantity: '200',
        tokenId: '',
      },
      hasSupply: true,
      prices: {
        base: '2',
        market: '1',
        actualPrice: '2',
        withSlippage: '2',
        withFees: '2',
        withFeesAndSlippage: '2',
        difference: '0',
        priceImpact: '100',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 19, buy B, limit price)', () => {
    const pool = mocks.mockedPools5[7] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '0',
        tokenId: 'tokenA',
      } as Balance.Amount,
      buy: {
        quantity: '100',
        tokenId: 'tokenB',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'limit',
      amounts: amounts,
      limitPrice: '2',
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'buy',
      frontendFeeTiers,
    })
    const calculation = calculations[0] as SwapOrderCalculation
    expect(calculation).toStrictEqual({
      order: {
        side: 'buy',
        slippage: 0,
        orderType: 'limit',
        limitPrice: '2',
        amounts: {
          sell: {
            quantity: '0',
            tokenId: 'tokenA',
          },
          buy: {
            quantity: '100',
            tokenId: 'tokenB',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '200',
          tokenId: 'tokenA',
        },
        buy: {
          quantity: '100',
          tokenId: 'tokenB',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenA',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '100',
        tokenId: 'tokenB',
      },
      ptTotalValueSpent: {
        quantity: '200',
        tokenId: '',
      },
      hasSupply: true,
      prices: {
        base: '2',
        market: '1',
        actualPrice: '2',
        withSlippage: '2',
        withFees: '2',
        withFeesAndSlippage: '2',
        difference: '0',
        priceImpact: '100',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 20, sell B, limit price)', () => {
    const pool = mocks.mockedPools5[7] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '200',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'limit',
      amounts: amounts,
      limitPrice: '2',
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'sell',
      frontendFeeTiers,
    })
    const calculation = calculations[0] as SwapOrderCalculation
    expect(calculation).toStrictEqual({
      order: {
        side: 'sell',
        slippage: 0,
        orderType: 'limit',
        limitPrice: '2',
        amounts: {
          sell: {
            quantity: '200',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '200',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '100',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '100',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: {
        quantity: '200',
        tokenId: '',
      },
      hasSupply: true,
      prices: {
        base: '2',
        market: '1',
        actualPrice: '2',
        withSlippage: '2',
        withFees: '2',
        withFeesAndSlippage: '2',
        difference: '0',
        priceImpact: '100',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 21, no FEF test)', () => {
    const pool = mocks.mockedPools5[7] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '99999999',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'limit',
      amounts: amounts,
      limitPrice: '1',
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: undefined,
      side: 'sell',
      frontendFeeTiers,
    })
    const calculation = calculations[0] as SwapOrderCalculation
    expect(calculation).toStrictEqual({
      order: {
        side: 'sell',
        slippage: 0,
        orderType: 'limit',
        limitPrice: '1',
        amounts: {
          sell: {
            quantity: '99999999',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: undefined,
      },
      sides: {
        sell: {
          quantity: '99999999',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '99999999',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '99999999',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: {
        quantity: '99999999',
        tokenId: '',
      },
      hasSupply: true,
      prices: {
        base: '1',
        market: '1',
        actualPrice: '1',
        withSlippage: '1',
        withFees: '1',
        withFeesAndSlippage: '1',
        difference: '0',
        priceImpact: '0',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 22, full FEF test)', () => {
    const pool = mocks.mockedPools5[7] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '100000000',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'limit',
      amounts: amounts,
      limitPrice: '1',
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: {
        quantity: '50',
        tokenId: 'tokenX',
      },
      side: 'sell',
      frontendFeeTiers,
    })
    const calculation = calculations[0] as SwapOrderCalculation
    expect(calculation).toStrictEqual({
      order: {
        side: 'sell',
        slippage: 0,
        orderType: 'limit',
        limitPrice: '1',
        amounts: {
          sell: {
            quantity: '100000000',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: {
          quantity: '50',
          tokenId: 'tokenX',
        },
      },
      sides: {
        sell: {
          quantity: '100000000',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '100000000',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: {
            fixedFee: '1000000',
            primaryTokenValueThreshold: '100000000',
            secondaryTokenBalanceThreshold: '0',
            variableFeeMultiplier: 0.0005,
          },
          fee: {
            quantity: '1050000',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '1050000',
        },
      },
      buyAmountWithSlippage: {
        quantity: '100000000',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: {
        quantity: '101050000',
        tokenId: '',
      },
      hasSupply: true,
      prices: {
        base: '1',
        market: '1',
        actualPrice: '1',
        withSlippage: '1',
        withFees: '1.0105',
        withFeesAndSlippage: '1.0105',
        difference: '1.05',
        priceImpact: '0',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 23, discount 1 FEF test)', () => {
    const pool = mocks.mockedPools5[7] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '100000000',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'limit',
      amounts: amounts,
      limitPrice: '1',
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: {
        quantity: '100',
        tokenId: 'tokenX',
      },
      side: 'sell',
      frontendFeeTiers,
    })
    const calculation = calculations[0] as SwapOrderCalculation
    expect(calculation).toStrictEqual({
      order: {
        side: 'sell',
        slippage: 0,
        orderType: 'limit',
        limitPrice: '1',
        amounts: {
          sell: {
            quantity: '100000000',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: {
          quantity: '100',
          tokenId: 'tokenX',
        },
      },
      sides: {
        sell: {
          quantity: '100000000',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '100000000',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: {
            fixedFee: '1000000',
            primaryTokenValueThreshold: '100000000',
            secondaryTokenBalanceThreshold: '100',
            variableFeeMultiplier: 0.00025,
          },
          fee: {
            quantity: '1025000',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '1025000',
        },
      },
      buyAmountWithSlippage: {
        quantity: '100000000',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: {
        quantity: '101025000',
        tokenId: '',
      },
      hasSupply: true,
      prices: {
        base: '1',
        market: '1',
        actualPrice: '1',
        withSlippage: '1',
        withFees: '1.01025',
        withFeesAndSlippage: '1.01025',
        difference: '1.025',
        priceImpact: '0',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 24, discount 2 FEF test)', () => {
    const pool = mocks.mockedPools5[7] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '100000000',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'limit',
      amounts: amounts,
      limitPrice: '1',
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: {
        quantity: '500',
        tokenId: 'tokenX',
      },
      side: 'sell',
      frontendFeeTiers,
    })
    const calculation = calculations[0] as SwapOrderCalculation
    expect(calculation).toStrictEqual({
      order: {
        side: 'sell',
        slippage: 0,
        orderType: 'limit',
        limitPrice: '1',
        amounts: {
          sell: {
            quantity: '100000000',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: {
          quantity: '500',
          tokenId: 'tokenX',
        },
      },
      sides: {
        sell: {
          quantity: '100000000',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '100000000',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: {
            fixedFee: '1000000',
            primaryTokenValueThreshold: '100000000',
            secondaryTokenBalanceThreshold: '500',
            variableFeeMultiplier: 0.0002,
          },
          fee: {
            quantity: '1020000',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '1020000',
        },
      },
      buyAmountWithSlippage: {
        quantity: '100000000',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: {
        quantity: '101020000',
        tokenId: '',
      },
      hasSupply: true,
      prices: {
        base: '1',
        market: '1',
        actualPrice: '1',
        withSlippage: '1',
        withFees: '1.0102',
        withFeesAndSlippage: '1.0102',
        difference: '1.02',
        priceImpact: '0',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 25, zero sell)', () => {
    const pool = mocks.mockedPools5[7] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '0',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'limit',
      amounts: amounts,
      limitPrice: '1',
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: {
        quantity: '50',
        tokenId: 'tokenX',
      },
      side: 'sell',
      frontendFeeTiers,
    })
    const calculation = calculations[0] as SwapOrderCalculation
    expect(calculation).toStrictEqual({
      order: {
        side: 'sell',
        slippage: 0,
        orderType: 'limit',
        limitPrice: '1',
        amounts: {
          sell: {
            quantity: '0',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: {
          quantity: '50',
          tokenId: 'tokenX',
        },
      },
      sides: {
        sell: {
          quantity: '0',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '0',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '0',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: undefined,
      hasSupply: true,
      prices: {
        base: '1',
        market: '1',
        actualPrice: '0',
        withSlippage: '0',
        withFees: '0',
        withFeesAndSlippage: '0',
        difference: '-100',
        priceImpact: '-100',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 26, zero buy)', () => {
    const pool = mocks.mockedPools5[7] as Swap.Pool
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '0',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }

    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: '1',
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: {
        quantity: '50',
        tokenId: 'tokenX',
      },
      side: 'buy',
      frontendFeeTiers,
    })
    const calculation = calculations[0] as SwapOrderCalculation
    expect(calculation).toStrictEqual({
      order: {
        side: 'buy',
        slippage: 0,
        orderType: 'market',
        limitPrice: '1',
        amounts: {
          sell: {
            quantity: '0',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: {
          quantity: '50',
          tokenId: 'tokenX',
        },
      },
      sides: {
        sell: {
          quantity: '0',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '0',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '0',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: undefined,
      hasSupply: true,
      prices: {
        base: '1',
        market: '1',
        actualPrice: '0',
        withSlippage: '0',
        withFees: '0',
        withFeesAndSlippage: '0',
        difference: '-100',
        priceImpact: '-100',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
  it('should calculate all fees and amounts correctly (case 27, zero pt sell side)', () => {
    const pool: Swap.Pool = mocks.mockedPools7[1]!
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '1',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }
    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: '',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: {
        quantity: '50',
        tokenId: 'tokenX',
      },
      side: 'buy',
      frontendFeeTiers,
    })
    const expectedCalculation: SwapOrderCalculation = {
      order: {
        side: 'buy',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '1',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: {
          quantity: '50',
          tokenId: 'tokenX',
        },
      },
      sides: {
        sell: {
          quantity: '0',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '0',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: '',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: '',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '0',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: undefined,
      hasSupply: true,
      prices: {
        base: '0.5',
        market: '0.5',
        actualPrice: '0',
        withSlippage: '0',
        withFees: '0',
        withFeesAndSlippage: '0',
        difference: '-100',
        priceImpact: '-100',
      },
      pool: pool,
    }
    expect(calculations[0]).toStrictEqual(expectedCalculation)
  })
  it('should calculate fees and amounts correctly (case 28, pt at buy side)', () => {
    const pool: Swap.Pool = mocks.mockedPools7[1]!
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '1000000',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }
    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: 'tokenA',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: {
        quantity: '50',
        tokenId: 'tokenX',
      },
      side: 'sell',
      frontendFeeTiers,
    })
    const expectedCalculation: SwapOrderCalculation = {
      order: {
        side: 'sell',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '1000000',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: {
          quantity: '50',
          tokenId: 'tokenX',
        },
      },
      sides: {
        sell: {
          quantity: '1000000',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '199',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: 'tokenA',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '199',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: undefined,
      hasSupply: true,
      prices: {
        base: '0.5',
        market: '0.5',
        actualPrice: '5025.12562814070351758794',
        withSlippage: '5025.12562814070351758794',
        withFees: '5025.12562814070351758794',
        withFeesAndSlippage: '5025.12562814070351758794',
        difference: '1004925.125628140703517588',
        priceImpact: '1004925.125628140703517588',
      },
      pool: pool,
    }
    expect(calculations[0]).toStrictEqual(expectedCalculation)
  })
  it('should calculate fees and amounts correctly (case 29, price impact, zero pool fee, sell)', () => {
    const pool: Swap.Pool = mocks.mockedPools8[0]!
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '250',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }
    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: 'tokenA',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: {
        quantity: '0',
        tokenId: 'tokenX',
      },
      side: 'sell',
      frontendFeeTiers,
    })
    const expectedCalculation: SwapOrderCalculation = {
      order: {
        side: 'sell',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '250',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: {
          quantity: '0',
          tokenId: 'tokenX',
        },
      },
      sides: {
        sell: {
          quantity: '250',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '200',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: 'tokenA',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '200',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: undefined,
      hasSupply: true,
      prices: {
        base: '1',
        market: '1',
        actualPrice: '1.25',
        withSlippage: '1.25',
        withFees: '1.25',
        withFeesAndSlippage: '1.25',
        difference: '25',
        priceImpact: '25',
      },
      pool: pool,
    }
    expect(calculations[0]).toStrictEqual(expectedCalculation)
  })
  it('should calculate fees and amounts correctly (case 30, price impact, with pool fee, sell)', () => {
    const pool: Swap.Pool = mocks.mockedPools8[1]!
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '500',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '0',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }
    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: 'tokenA',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: {
        quantity: '0',
        tokenId: 'tokenX',
      },
      side: 'sell',
      frontendFeeTiers,
    })
    const expectedCalculation: SwapOrderCalculation = {
      order: {
        side: 'sell',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '500',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: {
          quantity: '0',
          tokenId: 'tokenX',
        },
      },
      sides: {
        sell: {
          quantity: '500',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '200',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        liquidityFee: {
          quantity: '250',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: 'tokenA',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '200',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: undefined,
      hasSupply: true,
      prices: {
        base: '1',
        market: '1',
        actualPrice: '2.5',
        withSlippage: '2.5',
        withFees: '2.5',
        withFeesAndSlippage: '2.5',
        difference: '150',
        priceImpact: '150',
      },
      pool: pool,
    }
    expect(calculations[0]).toStrictEqual(expectedCalculation)
  })
  it('should calculate fees and amounts correctly (case 31, price impact, zero pool fee, buy)', () => {
    const pool: Swap.Pool = mocks.mockedPools8[0]!
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '0',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '200',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }
    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: 'tokenA',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: {
        quantity: '0',
        tokenId: 'tokenX',
      },
      side: 'buy',
      frontendFeeTiers,
    })
    const expectedCalculation: SwapOrderCalculation = {
      order: {
        side: 'buy',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '0',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '200',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: {
          quantity: '0',
          tokenId: 'tokenX',
        },
      },
      sides: {
        sell: {
          quantity: '251',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '200',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        liquidityFee: {
          quantity: '0',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: 'tokenA',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '200',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: undefined,
      hasSupply: true,
      prices: {
        base: '1',
        market: '1',
        actualPrice: '1.255',
        withSlippage: '1.255',
        withFees: '1.255',
        withFeesAndSlippage: '1.255',
        difference: '25.5',
        priceImpact: '25.5',
      },
      pool: pool,
    }
    expect(calculations[0]).toStrictEqual(expectedCalculation)
  })
  it('should calculate fees and amounts correctly (case 32, price impact, with pool fee, buy)', () => {
    const pool: Swap.Pool = mocks.mockedPools8[1]!
    const pools = [pool]
    const amounts = {
      sell: {
        quantity: '0',
        tokenId: 'tokenB',
      } as Balance.Amount,
      buy: {
        quantity: '200',
        tokenId: 'tokenA',
      } as Balance.Amount,
    }
    const slippage = 0
    const calculations = makeOrderCalculations({
      orderType: 'market',
      amounts: amounts,
      limitPrice: undefined,
      slippage: slippage,
      pools: pools,
      tokens: {
        sellInfo: {
          decimals: 0,
          id: 'tokenB',
        },
        buyInfo: {
          decimals: 0,
          id: 'tokenA',
        },
        ptInfo: {
          decimals: 6,
          id: 'tokenA',
        },
        priceDenomination: 0,
      },
      lpTokenHeld: {
        quantity: '0',
        tokenId: 'tokenX',
      },
      side: 'buy',
      frontendFeeTiers,
    })
    const expectedCalculation: SwapOrderCalculation = {
      order: {
        side: 'buy',
        slippage: 0,
        orderType: 'market',
        limitPrice: undefined,
        amounts: {
          sell: {
            quantity: '0',
            tokenId: 'tokenB',
          },
          buy: {
            quantity: '200',
            tokenId: 'tokenA',
          },
        },
        lpTokenHeld: {
          quantity: '0',
          tokenId: 'tokenX',
        },
      },
      sides: {
        sell: {
          quantity: '502',
          tokenId: 'tokenB',
        },
        buy: {
          quantity: '200',
          tokenId: 'tokenA',
        },
      },
      cost: {
        batcherFee: {
          quantity: '0',
          tokenId: '',
        },
        deposit: {
          quantity: '0',
          tokenId: '',
        },
        frontendFeeInfo: {
          discountTier: undefined,
          fee: {
            quantity: '0',
            tokenId: 'tokenA',
          },
        },
        liquidityFee: {
          quantity: '251',
          tokenId: 'tokenB',
        },

        ptTotalRequired: {
          tokenId: 'tokenA',
          quantity: '0',
        },
      },
      buyAmountWithSlippage: {
        quantity: '200',
        tokenId: 'tokenA',
      },
      ptTotalValueSpent: undefined,
      hasSupply: true,
      prices: {
        base: '1',
        market: '1',
        actualPrice: '2.51',
        withSlippage: '2.51',
        withFees: '2.51',
        withFeesAndSlippage: '2.51',
        difference: '151',
        priceImpact: '151',
      },
      pool: pool,
    }
    expect(calculations[0]).toStrictEqual(expectedCalculation)
  })
})
