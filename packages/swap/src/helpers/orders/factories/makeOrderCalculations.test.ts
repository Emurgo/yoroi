import {Balance, Swap} from '@yoroi/types'

import {makeOrderCalculations} from './makeOrderCalculations'
import {mocks} from '../../mocks'
import {getPriceAfterFee} from '../../prices/getPriceAfterFee'
import {SwapOrderCalculation} from '../../../translators/reactjs/state/state'

describe('makeOrderCalculations', () => {
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'sell',
    })
    const calculation = calculations[0] as SwapOrderCalculation
    const price_with_batcher_fee = getPriceAfterFee(
      pool,
      calculation.sides.sell.quantity,
      calculation.sides.buy.quantity,
      amounts.sell.tokenId,
    )
    expect(calculation.prices.withFeesNoFEF).toBe('0.06717514563300004847')
    expect(calculation.prices.withFeesNoFEF).toBe(
      price_with_batcher_fee.toString(),
    )
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
            variableFeeVisual: 0.05,
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
      },
      buyAmountWithSlippage: {
        quantity: '148894355282',
        tokenId: 'tokenB',
      },
      hasSupply: true,
      prices: {
        base: '0.06693552899045170664',
        market: '0.06693552899045170664',
        withSlippage: '0.06716171329034198007',
        withFees: '0.06721544266097425366',
        withFeesAndSlippage: '0.06721544266097425366',
        difference: '0.418183996965910966',
        withFeesNoFEF: '0.06717514563300004847',
        withFeesAndSlippageNoFEF: '0.06717514563300004847',
        differenceNoFEF: '0.357981248766291112',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'sell',
    })
    const calculation = calculations[0] as SwapOrderCalculation
    expect(calculation.prices.withFeesNoFEF).toBe('0.06717514563300004847')
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
            variableFeeVisual: 0.05,
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
      },
      buyAmountWithSlippage: {
        quantity: '148894355282',
        tokenId: 'tokenA',
      },
      hasSupply: true,
      prices: {
        base: '0.06693552899045170664',
        market: '0.06693552899045170664',
        withSlippage: '0.06716171329034198007',
        withFees: '0.06721544266097425366',
        withFeesAndSlippage: '0.06721544266097425366',
        difference: '0.418183996965910966',
        withFeesNoFEF: '0.06717514563300004847',
        withFeesAndSlippageNoFEF: '0.06717514563300004847',
        differenceNoFEF: '0.357981248766291112',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'buy',
    })
    const calculation = calculations[0] as SwapOrderCalculation
    const price_with_batcher_fee = getPriceAfterFee(
      pool,
      calculation.sides.sell.quantity,
      calculation.sides.buy.quantity,
      amounts.sell.tokenId,
    )
    // expect(calculation.prices.withFeesNoFEF).toBe('0.06717514564643239113')
    expect(calculation.prices.withFeesNoFEF).toBe(
      price_with_batcher_fee.toString(),
    )
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
            variableFeeVisual: 0.05,
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
      },
      buyAmountWithSlippage: {
        quantity: '148894355268',
        tokenId: 'tokenB',
      },
      hasSupply: true,
      prices: {
        base: '0.06693552899045170664',
        market: '0.06693552899045170664',
        withSlippage: '0.0671617132966569541',
        withFees: '0.06721544266729427966',
        withFeesAndSlippage: '0.06721544266729427966',
        difference: '0.418184006407871156',
        withFeesNoFEF: '0.06717514563931628549',
        withFeesAndSlippageNoFEF: '0.06717514563931628549',
        differenceNoFEF: '0.357981258202590661',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'buy',
    })
    const calculation = calculations[0] as SwapOrderCalculation
    const price_with_batcher_fee = getPriceAfterFee(
      pool,
      calculation.sides.buy.quantity,
      calculation.sides.sell.quantity,
      amounts.sell.tokenId,
    )
    expect(calculation.prices.withFeesNoFEF).toBe('0.06717514563931628549')
    expect(calculation.prices.withFeesNoFEF).toBe(
      price_with_batcher_fee.toString(),
    )
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
            variableFeeVisual: 0.05,
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
      },
      buyAmountWithSlippage: {
        quantity: '148894355268',
        tokenId: 'tokenA',
      },
      hasSupply: true,
      prices: {
        base: '0.06693552899045170664',
        market: '0.06693552899045170664',
        withSlippage: '0.0671617132966569541',
        withFees: '0.06721544266729427966',
        withFeesAndSlippage: '0.06721544266729427966',
        difference: '0.418184006407871156',
        withFeesNoFEF: '0.06717514563931628549',
        withFeesAndSlippageNoFEF: '0.06717514563931628549',
        differenceNoFEF: '0.357981258202590661',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'sell',
    })
    const calculation = calculations[0] as SwapOrderCalculation
    const price_with_batcher_fee = getPriceAfterFee(
      pool,
      calculation.sides.sell.quantity,
      calculation.sides.buy.quantity,
      amounts.sell.tokenId,
    )
    expect(calculation.prices.withFeesNoFEF).toBe('1')
    expect(calculation.prices.withFeesNoFEF).toBe(
      price_with_batcher_fee.toString(),
    )
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
      },
      buyAmountWithSlippage: {
        quantity: '50',
        tokenId: 'tokenB',
      },
      hasSupply: true,
      prices: {
        base: '0.99009900990099009901',
        market: '0.99009900990099009901',
        withSlippage: '2',
        withFees: '1',
        withFeesAndSlippage: '2',
        difference: '1',
        withFeesNoFEF: '1',
        withFeesAndSlippageNoFEF: '2',
        differenceNoFEF: '1',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'sell',
    })
    const calculation = calculations[0] as SwapOrderCalculation
    const price_with_batcher_fee = getPriceAfterFee(
      pool,
      calculation.sides.sell.quantity,
      calculation.sides.buy.quantity,
      amounts.sell.tokenId,
    )
    expect(calculation.prices.withFeesNoFEF).toBe('0')
    expect(calculation.prices.withFeesNoFEF).toBe(
      price_with_batcher_fee.toString(),
    )
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
      },
      buyAmountWithSlippage: {
        quantity: '0',
        tokenId: 'tokenB',
      },
      hasSupply: false,
      prices: {
        base: '0',
        market: '0',
        withSlippage: '0',
        withFees: '0',
        withFeesAndSlippage: '0',
        difference: '0',
        withFeesNoFEF: '0',
        withFeesAndSlippageNoFEF: '0',
        differenceNoFEF: '0',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'sell',
    })
    const calculation = calculations[0] as SwapOrderCalculation
    const price_with_batcher_fee = getPriceAfterFee(
      pool,
      calculation.sides.sell.quantity,
      calculation.sides.buy.quantity,
      amounts.sell.tokenId,
    )
    expect(calculation.prices.withFeesNoFEF).toBe('0')
    expect(calculation.prices.withFeesNoFEF).toBe(
      price_with_batcher_fee.toString(),
    )
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
      },
      buyAmountWithSlippage: {
        quantity: '0',
        tokenId: 'tokenB',
      },
      hasSupply: true,
      prices: {
        base: '1',
        market: '1',
        withSlippage: '0',
        withFees: '0',
        withFeesAndSlippage: '0',
        difference: '-100',
        withFeesNoFEF: '0',
        withFeesAndSlippageNoFEF: '0',
        differenceNoFEF: '-100',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'buy',
    })
    const calculation = calculations[0] as SwapOrderCalculation
    const price_with_batcher_fee = getPriceAfterFee(
      pool,
      calculation.sides.buy.quantity,
      calculation.sides.sell.quantity,
      amounts.sell.tokenId,
    )
    expect(calculation.prices.withFeesNoFEF).toBe('0.01')
    expect(calculation.prices.withFeesNoFEF).toBe(
      price_with_batcher_fee.toString(),
    )
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
      },
      buyAmountWithSlippage: {
        quantity: '100',
        tokenId: 'tokenA',
      },
      hasSupply: false,
      prices: {
        base: '1',
        market: '1',
        withSlippage: '0.01',
        withFees: '0.01',
        withFeesAndSlippage: '0.01',
        difference: '-99',
        withFeesNoFEF: '0.01',
        withFeesAndSlippageNoFEF: '0.01',
        differenceNoFEF: '-99',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'sell',
    })
    const calculation = calculations[0] as SwapOrderCalculation
    const price_with_batcher_fee = getPriceAfterFee(
      pool,
      calculation.sides.sell.quantity,
      calculation.sides.buy.quantity,
      amounts.sell.tokenId,
    )
    expect(calculation.prices.withFeesNoFEF).toBe('100')
    expect(calculation.prices.withFeesNoFEF).toBe(
      price_with_batcher_fee.toString(),
    )
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
      },
      buyAmountWithSlippage: {
        quantity: '1',
        tokenId: 'tokenB',
      },
      hasSupply: true,
      prices: {
        base: '0',
        market: '0',
        withSlippage: '100',
        withFees: '100',
        withFeesAndSlippage: '100',
        difference: '0',
        withFeesNoFEF: '100',
        withFeesAndSlippageNoFEF: '100',
        differenceNoFEF: '0',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'sell',
    })
    const calculation = calculations[0] as SwapOrderCalculation
    const price_with_batcher_fee = getPriceAfterFee(
      pool,
      calculation.sides.sell.quantity,
      calculation.sides.buy.quantity,
      amounts.sell.tokenId,
    )
    expect(calculation.prices.withFeesNoFEF).toBe('0')
    expect(calculation.prices.withFeesNoFEF).toBe(
      price_with_batcher_fee.toString(),
    )
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
      },
      buyAmountWithSlippage: {
        quantity: '0',
        tokenId: 'tokenB',
      },
      hasSupply: false,
      prices: {
        base: '0',
        market: '0',
        withSlippage: '0',
        withFees: '0',
        withFeesAndSlippage: '0',
        difference: '0',
        withFeesNoFEF: '0',
        withFeesAndSlippageNoFEF: '0',
        differenceNoFEF: '0',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'buy',
    })
    const calculation = calculations[0] as SwapOrderCalculation
    const price_with_batcher_fee = getPriceAfterFee(
      pool,
      calculation.sides.sell.quantity,
      calculation.sides.buy.quantity,
      amounts.sell.tokenId,
    )
    expect(calculation.prices.withFeesNoFEF).toBe('0')
    expect(calculation.prices.withFeesNoFEF).toBe(
      price_with_batcher_fee.toString(),
    )
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
      },
      buyAmountWithSlippage: {
        quantity: '100',
        tokenId: 'tokenA',
      },
      hasSupply: false,
      prices: {
        base: '0',
        market: '0',
        withSlippage: '0',
        withFees: '0',
        withFeesAndSlippage: '0',
        difference: '0',
        withFeesNoFEF: '0',
        withFeesAndSlippageNoFEF: '0',
        differenceNoFEF: '0',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'buy',
    })
    const calculation = calculations[0] as SwapOrderCalculation
    const price_with_batcher_fee = getPriceAfterFee(
      pool,
      calculation.sides.buy.quantity,
      calculation.sides.sell.quantity,
      amounts.sell.tokenId,
    )
    expect(calculation.prices.withFeesNoFEF).toBe('0.01')
    expect(calculation.prices.withFeesNoFEF).toBe(
      price_with_batcher_fee.toString(),
    )
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
      },
      buyAmountWithSlippage: {
        quantity: '100',
        tokenId: 'tokenA',
      },
      hasSupply: false,
      prices: {
        base: '0',
        market: '0',
        withSlippage: '0.01',
        withFees: '0.01',
        withFeesAndSlippage: '0.01',
        difference: '0',
        withFeesNoFEF: '0.01',
        withFeesAndSlippageNoFEF: '0.01',
        differenceNoFEF: '0',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'sell',
    })
    const calculation = calculations[0] as SwapOrderCalculation
    const price_with_batcher_fee = getPriceAfterFee(
      pool,
      calculation.sides.buy.quantity,
      calculation.sides.sell.quantity,
      amounts.sell.tokenId,
    )
    expect(calculation.prices.withFeesNoFEF).toBe('100')
    expect(calculation.prices.withFeesNoFEF).toBe(
      price_with_batcher_fee.toString(),
    )
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
      },
      buyAmountWithSlippage: {
        quantity: '1',
        tokenId: 'tokenA',
      },
      hasSupply: true,
      prices: {
        base: '0',
        market: '0',
        withSlippage: '100',
        withFees: '100',
        withFeesAndSlippage: '100',
        difference: '0',
        withFeesNoFEF: '100',
        withFeesAndSlippageNoFEF: '100',
        differenceNoFEF: '0',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'sell',
    })
    const calculation = calculations[0] as SwapOrderCalculation
    const price_with_batcher_fee = getPriceAfterFee(
      pool,
      calculation.sides.sell.quantity,
      calculation.sides.buy.quantity,
      amounts.sell.tokenId,
    )
    expect(calculation.prices.withFeesNoFEF).toBe('0')
    expect(calculation.prices.withFeesNoFEF).toBe(
      price_with_batcher_fee.toString(),
    )
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
      },
      buyAmountWithSlippage: {
        quantity: '0',
        tokenId: 'tokenA',
      },
      hasSupply: false,
      prices: {
        base: '0',
        market: '0',
        withSlippage: '0',
        withFees: '0',
        withFeesAndSlippage: '0',
        difference: '0',
        withFeesNoFEF: '0',
        withFeesAndSlippageNoFEF: '0',
        differenceNoFEF: '0',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'buy',
    })
    const calculation = calculations[0] as SwapOrderCalculation
    const price_with_batcher_fee = getPriceAfterFee(
      pool,
      calculation.sides.sell.quantity,
      calculation.sides.buy.quantity,
      amounts.sell.tokenId,
    )
    expect(calculation.prices.withFeesNoFEF).toBe('0')
    expect(calculation.prices.withFeesNoFEF).toBe(
      price_with_batcher_fee.toString(),
    )
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
      },
      buyAmountWithSlippage: {
        quantity: '100',
        tokenId: 'tokenB',
      },
      hasSupply: false,
      prices: {
        base: '0',
        market: '0',
        withSlippage: '0',
        withFees: '0',
        withFeesAndSlippage: '0',
        difference: '0',
        withFeesNoFEF: '0',
        withFeesAndSlippageNoFEF: '0',
        differenceNoFEF: '0',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'buy',
    })
    const calculation = calculations[0] as SwapOrderCalculation
    const price_with_batcher_fee = getPriceAfterFee(
      pool,
      calculation.sides.sell.quantity,
      calculation.sides.buy.quantity,
      amounts.sell.tokenId,
    )
    expect(calculation.prices.withFeesNoFEF).toBe('0.01')
    expect(calculation.prices.withFeesNoFEF).toBe(
      price_with_batcher_fee.toString(),
    )
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
      },
      buyAmountWithSlippage: {
        quantity: '100',
        tokenId: 'tokenB',
      },
      hasSupply: false,
      prices: {
        base: '0',
        market: '0',
        withSlippage: '0.01',
        withFees: '0.01',
        withFeesAndSlippage: '0.01',
        difference: '0',
        withFeesNoFEF: '0.01',
        withFeesAndSlippageNoFEF: '0.01',
        differenceNoFEF: '0',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'buy',
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
      },
      buyAmountWithSlippage: {
        quantity: '100',
        tokenId: 'tokenA',
      },
      hasSupply: true,
      prices: {
        base: '2',
        market: '1',
        withSlippage: '2',
        withFees: '2',
        withFeesAndSlippage: '2',
        difference: '0',
        withFeesNoFEF: '2',
        withFeesAndSlippageNoFEF: '2',
        differenceNoFEF: '0',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'sell',
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
      },
      buyAmountWithSlippage: {
        quantity: '100',
        tokenId: 'tokenB',
      },
      hasSupply: true,
      prices: {
        base: '2',
        market: '1',
        withSlippage: '2',
        withFees: '2',
        withFeesAndSlippage: '2',
        difference: '0',
        withFeesNoFEF: '2',
        withFeesAndSlippageNoFEF: '2',
        differenceNoFEF: '0',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'buy',
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
      },
      buyAmountWithSlippage: {
        quantity: '100',
        tokenId: 'tokenB',
      },
      hasSupply: true,
      prices: {
        base: '2',
        market: '1',
        withSlippage: '2',
        withFees: '2',
        withFeesAndSlippage: '2',
        difference: '0',
        withFeesNoFEF: '2',
        withFeesAndSlippageNoFEF: '2',
        differenceNoFEF: '0',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'sell',
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
      },
      buyAmountWithSlippage: {
        quantity: '100',
        tokenId: 'tokenA',
      },
      hasSupply: true,
      prices: {
        base: '2',
        market: '1',
        withSlippage: '2',
        withFees: '2',
        withFeesAndSlippage: '2',
        difference: '0',
        withFeesNoFEF: '2',
        withFeesAndSlippageNoFEF: '2',
        differenceNoFEF: '0',
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
      primaryTokenId: '',
      lpTokenHeld: undefined,
      side: 'sell',
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
      },
      buyAmountWithSlippage: {
        quantity: '99999999',
        tokenId: 'tokenA',
      },
      hasSupply: true,
      prices: {
        base: '1',
        market: '1',
        withSlippage: '1',
        withFees: '1',
        withFeesAndSlippage: '1',
        difference: '0',
        withFeesNoFEF: '1',
        withFeesAndSlippageNoFEF: '1',
        differenceNoFEF: '0',
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
      primaryTokenId: '',
      lpTokenHeld: {
        quantity: '50',
        tokenId: 'tokenX',
      },
      side: 'sell',
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
            variableFeeVisual: 0.05,
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
      },
      buyAmountWithSlippage: {
        quantity: '100000000',
        tokenId: 'tokenA',
      },
      hasSupply: true,
      prices: {
        base: '1',
        market: '1',
        withSlippage: '1',
        withFees: '1.0105',
        withFeesAndSlippage: '1.0105',
        difference: '1.05',
        withFeesNoFEF: '1',
        withFeesAndSlippageNoFEF: '1',
        differenceNoFEF: '0',
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
      primaryTokenId: '',
      lpTokenHeld: {
        quantity: '100',
        tokenId: 'tokenX',
      },
      side: 'sell',
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
            variableFeeVisual: 0.025,
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
      },
      buyAmountWithSlippage: {
        quantity: '100000000',
        tokenId: 'tokenA',
      },
      hasSupply: true,
      prices: {
        base: '1',
        market: '1',
        withSlippage: '1',
        withFees: '1.01025',
        withFeesAndSlippage: '1.01025',
        difference: '1.025',
        withFeesNoFEF: '1',
        withFeesAndSlippageNoFEF: '1',
        differenceNoFEF: '0',
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
      primaryTokenId: '',
      lpTokenHeld: {
        quantity: '500',
        tokenId: 'tokenX',
      },
      side: 'sell',
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
            variableFeeVisual: 0.02,
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
      },
      buyAmountWithSlippage: {
        quantity: '100000000',
        tokenId: 'tokenA',
      },
      hasSupply: true,
      prices: {
        base: '1',
        market: '1',
        withSlippage: '1',
        withFees: '1.0102',
        withFeesAndSlippage: '1.0102',
        difference: '1.02',
        withFeesNoFEF: '1',
        withFeesAndSlippageNoFEF: '1',
        differenceNoFEF: '0',
      },
      pool: pools[0],
    } as SwapOrderCalculation)
  })
})
