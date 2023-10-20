import {Swap} from '@yoroi/types'
import {SwapOrderCalculation} from 'translators/reactjs/state/state'

const mockedPools1: Swap.Pool[] = [
  {
    tokenA: {quantity: '529504614', tokenId: 'tokenA'},
    tokenB: {quantity: '7339640354', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.3', // 0.3%
    provider: 'muesliswap_v2',
    batcherFee: {quantity: '950000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '1',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenA: {quantity: '143610201719', tokenId: 'tokenA'},
    tokenB: {quantity: '2055821866531', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.3', // 0.3%
    provider: 'vyfi',
    batcherFee: {quantity: '1900000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '2',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenA: {quantity: '27344918300893', tokenId: 'tokenA'},
    tokenB: {quantity: '393223050468514', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.3', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: '2000000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '3',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenA: {quantity: '3400529909', tokenId: 'tokenA'},
    tokenB: {quantity: '49215467634', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.35', // 0.35%
    provider: 'wingriders',
    batcherFee: {quantity: '2000000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '4',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenA: {quantity: '10178222382', tokenId: 'tokenA'},
    tokenB: {quantity: '145009426744', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.3', // 0.3%
    provider: 'sundaeswap',
    batcherFee: {quantity: '2500000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '5',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenA: {quantity: '973669994', tokenId: 'tokenA'},
    tokenB: {quantity: '13710853133', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.05', // 0.05%
    provider: 'sundaeswap',
    batcherFee: {quantity: '2500000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '6',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
]

const mockedPools2: Swap.Pool[] = [
  {
    tokenA: {quantity: '529504614', tokenId: 'tokenA'},
    tokenB: {quantity: '7339640354', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.3', // 0.3%
    provider: 'muesliswap_v2',
    batcherFee: {quantity: '950000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },

  {
    tokenA: {quantity: '143610201719', tokenId: 'tokenA'},
    tokenB: {quantity: '2055821866531', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.3', // 0.3%
    provider: 'vyfi',
    batcherFee: {quantity: '1900000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },

  {
    tokenA: {quantity: '27344918300893', tokenId: 'tokenA'},
    tokenB: {quantity: '393223050468514', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.3', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: '2000000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },

  {
    tokenA: {quantity: '3400529909', tokenId: 'tokenA'},
    tokenB: {quantity: '49215467634', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.35', // 0.35%
    provider: 'wingriders',
    batcherFee: {quantity: '2000000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },

  {
    tokenA: {quantity: '10178222382', tokenId: 'tokenA'},
    tokenB: {quantity: '145009426744', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.3', // 0.3%
    provider: 'sundaeswap',
    batcherFee: {quantity: '2500000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },

  {
    tokenA: {quantity: '973669994', tokenId: 'tokenA'},
    tokenB: {quantity: '13710853133', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.05', // 0.05%
    provider: 'sundaeswap',
    batcherFee: {quantity: '2500000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
]
const mockedPools3: Swap.Pool[] = [
  {
    tokenA: {quantity: '529504614', tokenId: 'tokenA'},
    tokenB: {quantity: '7339640354', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.06950020009',
    fee: '0.3', // 0.3%
    provider: 'muesliswap_v2',
    batcherFee: {quantity: '950000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenA: {quantity: '143610201719', tokenId: 'tokenA'},
    tokenB: {quantity: '2055821866531', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.06950020009',
    fee: '0.3', // 0.3%
    provider: 'vyfi',
    batcherFee: {quantity: '1900000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenA: {quantity: '27337840212697', tokenId: 'tokenA'},
    tokenB: {quantity: '393349086430693', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.06950020009',
    fee: '0.3', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: '2000000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenA: {quantity: '3400529909', tokenId: 'tokenA'},
    tokenB: {quantity: '49215467634', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.06950020009',
    fee: '0.35', // 0.35%
    provider: 'wingriders',
    batcherFee: {quantity: '2000000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenA: {quantity: '10178222382', tokenId: 'tokenA'},
    tokenB: {quantity: '145009426744', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.06950020009',
    fee: '0.3', // 0.3%
    provider: 'sundaeswap',
    batcherFee: {quantity: '2500000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenA: {quantity: '973669994', tokenId: 'tokenA'},
    tokenB: {quantity: '13710853133', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.06950020009',
    fee: '0.05', // 0.05%
    provider: 'sundaeswap',
    batcherFee: {quantity: '2500000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
]
const mockedPools4: Swap.Pool[] = [
  {
    tokenB: {quantity: '529504614', tokenId: 'tokenB'},
    tokenA: {quantity: '7339640354', tokenId: 'tokenA'},
    ptPriceTokenB: '1',
    ptPriceTokenA: '0.06950020009',
    fee: '0.3', // 0.3%
    provider: 'muesliswap_v2',
    batcherFee: {quantity: '950000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenB: {quantity: '143610201719', tokenId: 'tokenB'},
    tokenA: {quantity: '2055821866531', tokenId: 'tokenA'},
    ptPriceTokenB: '1',
    ptPriceTokenA: '0.06950020009',
    fee: '0.3', // 0.3%
    provider: 'vyfi',
    batcherFee: {quantity: '1900000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenB: {quantity: '27337840212697', tokenId: 'tokenB'},
    tokenA: {quantity: '393349086430693', tokenId: 'tokenA'},
    ptPriceTokenB: '1',
    ptPriceTokenA: '0.06950020009',
    fee: '0.3', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: '2000000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenB: {quantity: '3400529909', tokenId: 'tokenB'},
    tokenA: {quantity: '49215467634', tokenId: 'tokenA'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.06950020009',
    fee: '0.35', // 0.35%
    provider: 'wingriders',
    batcherFee: {quantity: '2000000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenB: {quantity: '10178222382', tokenId: 'tokenB'},
    tokenA: {quantity: '145009426744', tokenId: 'tokenA'},
    ptPriceTokenB: '1',
    ptPriceTokenA: '0.06950020009',
    fee: '0.3', // 0.3%
    provider: 'sundaeswap',
    batcherFee: {quantity: '2500000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenB: {quantity: '973669994', tokenId: 'tokenB'},
    tokenA: {quantity: '13710853133', tokenId: 'tokenA'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.06950020009',
    fee: '0.05', // 0.05%
    provider: 'sundaeswap',
    batcherFee: {quantity: '2500000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
]

const mockedPools5: Swap.Pool[] = [
  {
    tokenA: {quantity: '27019025551205', tokenId: 'tokenA'},
    tokenB: {quantity: '403657459031350', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.06693552899',
    fee: '0.3', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: '2000000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenB: {quantity: '27019025551205', tokenId: 'tokenB'},
    tokenA: {quantity: '403657459031350', tokenId: 'tokenA'},
    ptPriceTokenB: '1',
    ptPriceTokenA: '0.06693552899',
    fee: '0.3', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: '2000000', tokenId: ''},
    deposit: {quantity: '2000000', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenA: {quantity: '10000', tokenId: 'tokenA'},
    tokenB: {quantity: '10100', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '1',
    fee: '0', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: '0', tokenId: ''},
    deposit: {quantity: '0', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenA: {quantity: '0', tokenId: 'tokenA'},
    tokenB: {quantity: '0', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '1',
    fee: '0', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: '0', tokenId: ''},
    deposit: {quantity: '0', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenA: {quantity: '1', tokenId: 'tokenA'},
    tokenB: {quantity: '1', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '1',
    fee: '0', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: '0', tokenId: ''},
    deposit: {quantity: '0', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenA: {quantity: '0', tokenId: 'tokenA'},
    tokenB: {quantity: '1', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '1',
    fee: '0', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: '0', tokenId: ''},
    deposit: {quantity: '0', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenA: {quantity: '1', tokenId: 'tokenA'},
    tokenB: {quantity: '0', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '1',
    fee: '0', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: '0', tokenId: ''},
    deposit: {quantity: '0', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
  {
    tokenA: {quantity: '10000000000', tokenId: 'tokenA'},
    tokenB: {quantity: '10000000000', tokenId: 'tokenB'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '1',
    fee: '0', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: '0', tokenId: ''},
    deposit: {quantity: '0', tokenId: ''},
    poolId: '0',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
]

const mockedOrderCalculations1: SwapOrderCalculation[] = [
  {
    order: {
      side: 'sell',
      slippage: 10,
      orderType: 'market',
      amounts: {
        sell: {
          quantity: '100000000',
          tokenId: 'tokenA',
        },
        buy: {
          quantity: '0',
          tokenId: 'tokenB',
        },
      },
    },
    sides: {
      buy: {
        quantity: '1162995513',
        tokenId: 'tokenB',
      },
      sell: {
        quantity: '100000000',
        tokenId: 'tokenA',
      },
    },
    cost: {
      ptTotalFeeNoFEF: {
        quantity: '2950000',
        tokenId: '',
      },
      ptTotalFee: {
        quantity: '3050000',
        tokenId: '',
      },
      batcherFee: {
        quantity: '950000',
        tokenId: '',
      },
      deposit: {
        quantity: '2000000',
        tokenId: '',
      },
      frontendFeeInfo: {
        fee: {
          tokenId: '',
          quantity: '1050000',
        },
        discountTier: {
          primaryTokenValueThreshold: '100000000',
          secondaryTokenBalanceThreshold: '0',
          variableFeeMultiplier: 0.0005,
          fixedFee: '1000000',
        },
      },
      liquidityFee: {
        tokenId: 'tokenA',
        quantity: '300000',
      },
    },
    buyAmountWithSlippage: {
      quantity: '1046695961',
      tokenId: 'tokenB',
    },
    hasSupply: true,
    prices: {
      base: '0.07214312806368332309',
      market: '0.07214312806368332309',
      withSlippage: '0.09553872731529533436',
      withFees: '0.08770455161678684826',
      withFeesAndSlippage: '0.09744950186160124105',
      difference: '21.570209070179074072',
      withFeesNoFEF: '0.08680171064426110129',
      withFeesAndSlippageNoFEF: '0.09644634522479064004',
      differenceNoFEF: '20.318751035633113011',
    },
    pool: {
      tokenA: {
        quantity: '529504614',
        tokenId: 'tokenA',
      },
      tokenB: {
        quantity: '7339640354',
        tokenId: 'tokenB',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3',
      provider: 'muesliswap_v2',
      batcherFee: {
        quantity: '950000',
        tokenId: '',
      },
      deposit: {
        quantity: '2000000',
        tokenId: '',
      },
      poolId: '1',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    },
  },
  {
    order: {
      side: 'sell',
      slippage: 10,
      orderType: 'market',
      amounts: {
        sell: {
          quantity: '100000000',
          tokenId: 'tokenA',
        },
        buy: {
          quantity: '0',
          tokenId: 'tokenB',
        },
      },
    },
    sides: {
      buy: {
        quantity: '1426244382',
        tokenId: 'tokenB',
      },
      sell: {
        quantity: '100000000',
        tokenId: 'tokenA',
      },
    },
    cost: {
      ptTotalFeeNoFEF: {
        quantity: '3900000',
        tokenId: '',
      },
      ptTotalFee: {
        quantity: '4950000',
        tokenId: '',
      },
      batcherFee: {
        quantity: '1900000',
        tokenId: '',
      },
      deposit: {
        quantity: '2000000',
        tokenId: '',
      },
      frontendFeeInfo: {
        fee: {
          tokenId: '',
          quantity: '1050000',
        },
        discountTier: {
          primaryTokenValueThreshold: '100000000',
          secondaryTokenBalanceThreshold: '0',
          variableFeeMultiplier: 0.0005,
          fixedFee: '1000000',
        },
      },
      liquidityFee: {
        tokenId: 'tokenA',
        quantity: '300000',
      },
    },
    buyAmountWithSlippage: {
      quantity: '1283619943',
      tokenId: 'tokenB',
    },
    hasSupply: true,
    prices: {
      base: '0.06985537222703457584',
      market: '0.06985537222703457584',
      withSlippage: '0.07790467929805294401',
      withFees: '0.07218258055862406896',
      withFeesAndSlippage: '0.08020286733734550586',
      difference: '3.33146651058691987',
      withFeesNoFEF: '0.07144638133971629555',
      withFeesAndSlippageNoFEF: '0.07938486820471594995',
      differenceNoFEF: '2.277575885661069787',
    },
    pool: {
      tokenA: {
        quantity: '143610201719',
        tokenId: 'tokenA',
      },
      tokenB: {
        quantity: '2055821866531',
        tokenId: 'tokenB',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3',
      provider: 'vyfi',
      batcherFee: {
        quantity: '1900000',
        tokenId: '',
      },
      deposit: {
        quantity: '2000000',
        tokenId: '',
      },
      poolId: '2',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    },
  },
  {
    order: {
      side: 'sell',
      slippage: 10,
      orderType: 'market',
      amounts: {
        sell: {
          quantity: '100000000',
          tokenId: 'tokenA',
        },
        buy: {
          quantity: '0',
          tokenId: 'tokenB',
        },
      },
    },
    sides: {
      buy: {
        quantity: '1433692167',
        tokenId: 'tokenB',
      },
      sell: {
        quantity: '100000000',
        tokenId: 'tokenA',
      },
    },
    cost: {
      ptTotalFeeNoFEF: {
        quantity: '4000000',
        tokenId: '',
      },
      ptTotalFee: {
        quantity: '5050000',
        tokenId: '',
      },
      batcherFee: {
        quantity: '2000000',
        tokenId: '',
      },
      deposit: {
        quantity: '2000000',
        tokenId: '',
      },
      frontendFeeInfo: {
        fee: {
          tokenId: '',
          quantity: '1050000',
        },
        discountTier: {
          primaryTokenValueThreshold: '100000000',
          secondaryTokenBalanceThreshold: '0',
          variableFeeMultiplier: 0.0005,
          fixedFee: '1000000',
        },
      },
      liquidityFee: {
        tokenId: 'tokenA',
        quantity: '300000',
      },
    },
    buyAmountWithSlippage: {
      quantity: '1290322950',
      tokenId: 'tokenB',
    },
    hasSupply: true,
    prices: {
      base: '0.06954047650134526242',
      market: '0.06954047650134526242',
      withSlippage: '0.07749997781563135028',
      withFees: '0.0718773544083958157',
      withFeesAndSlippage: '0.07986372713900810646',
      difference: '3.360457138951796387',
      withFeesNoFEF: '0.07114497961820837653',
      withFeesAndSlippageNoFEF: '0.07904997737194397728',
      differenceNoFEF: '2.307293820214296279',
    },
    pool: {
      tokenA: {
        quantity: '27344918300893',
        tokenId: 'tokenA',
      },
      tokenB: {
        quantity: '393223050468514',
        tokenId: 'tokenB',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3',
      provider: 'minswap',
      batcherFee: {
        quantity: '2000000',
        tokenId: '',
      },
      deposit: {
        quantity: '2000000',
        tokenId: '',
      },
      poolId: '3',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    },
  },
  {
    order: {
      side: 'sell',
      slippage: 10,
      orderType: 'market',
      amounts: {
        sell: {
          quantity: '100000000',
          tokenId: 'tokenA',
        },
        buy: {
          quantity: '0',
          tokenId: 'tokenB',
        },
      },
    },
    sides: {
      buy: {
        quantity: '1401162647',
        tokenId: 'tokenB',
      },
      sell: {
        quantity: '100000000',
        tokenId: 'tokenA',
      },
    },
    cost: {
      ptTotalFeeNoFEF: {
        quantity: '4000000',
        tokenId: '',
      },
      ptTotalFee: {
        quantity: '5050000',
        tokenId: '',
      },
      batcherFee: {
        quantity: '2000000',
        tokenId: '',
      },
      deposit: {
        quantity: '2000000',
        tokenId: '',
      },
      frontendFeeInfo: {
        fee: {
          tokenId: '',
          quantity: '1050000',
        },
        discountTier: {
          primaryTokenValueThreshold: '100000000',
          secondaryTokenBalanceThreshold: '0',
          variableFeeMultiplier: 0.0005,
          fixedFee: '1000000',
        },
      },
      liquidityFee: {
        tokenId: 'tokenA',
        quantity: '350000',
      },
    },
    buyAmountWithSlippage: {
      quantity: '1261046382',
      tokenId: 'tokenB',
    },
    hasSupply: true,
    prices: {
      base: '0.06909473936707611128',
      market: '0.06909473936707611128',
      withSlippage: '0.07929922438015448031',
      withFees: '0.07354606563387783488',
      withFeesAndSlippage: '0.08171785072374919196',
      difference: '6.44235191792733844',
      withFeesNoFEF: '0.07279668796366365025',
      withFeesAndSlippageNoFEF: '0.08088520886775756992',
      differenceNoFEF: '5.357786468981936163',
    },
    pool: {
      tokenA: {
        quantity: '3400529909',
        tokenId: 'tokenA',
      },
      tokenB: {
        quantity: '49215467634',
        tokenId: 'tokenB',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.35',
      provider: 'wingriders',
      batcherFee: {
        quantity: '2000000',
        tokenId: '',
      },
      deposit: {
        quantity: '2000000',
        tokenId: '',
      },
      poolId: '4',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    },
  },
  {
    order: {
      side: 'sell',
      slippage: 10,
      orderType: 'market',
      amounts: {
        sell: {
          quantity: '100000000',
          tokenId: 'tokenA',
        },
        buy: {
          quantity: '0',
          tokenId: 'tokenB',
        },
      },
    },
    sides: {
      buy: {
        quantity: '1406650031',
        tokenId: 'tokenB',
      },
      sell: {
        quantity: '100000000',
        tokenId: 'tokenA',
      },
    },
    cost: {
      ptTotalFeeNoFEF: {
        quantity: '4500000',
        tokenId: '',
      },
      ptTotalFee: {
        quantity: '5050000',
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
          quantity: '1050000',
        },
        discountTier: {
          primaryTokenValueThreshold: '100000000',
          secondaryTokenBalanceThreshold: '0',
          variableFeeMultiplier: 0.0005,
          fixedFee: '1000000',
        },
      },
      liquidityFee: {
        tokenId: 'tokenA',
        quantity: '300000',
      },
    },
    buyAmountWithSlippage: {
      quantity: '1265985027',
      tokenId: 'tokenB',
    },
    hasSupply: true,
    prices: {
      base: '0.07019007391821953012',
      market: '0.07019007391821953012',
      withSlippage: '0.07898987576256697703',
      withFees: '0.07361461466459101084',
      withFeesAndSlippage: '0.08179401635213810471',
      difference: '4.878953041653028379',
      withFeesNoFEF: '0.07286816033916541392',
      withFeesAndSlippageNoFEF: '0.08096462265663115145',
      differenceNoFEF: '3.81547741930888855',
    },
    pool: {
      tokenA: {
        quantity: '10178222382',
        tokenId: 'tokenA',
      },
      tokenB: {
        quantity: '145009426744',
        tokenId: 'tokenB',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3',
      provider: 'sundaeswap',
      batcherFee: {
        quantity: '2500000',
        tokenId: '',
      },
      deposit: {
        quantity: '2000000',
        tokenId: '',
      },
      poolId: '5',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    },
  },
  {
    order: {
      side: 'sell',
      slippage: 10,
      orderType: 'market',
      amounts: {
        sell: {
          quantity: '100000000',
          tokenId: 'tokenA',
        },
        buy: {
          quantity: '0',
          tokenId: 'tokenB',
        },
      },
    },
    sides: {
      buy: {
        quantity: '1276429070',
        tokenId: 'tokenB',
      },
      sell: {
        quantity: '100000000',
        tokenId: 'tokenA',
      },
    },
    cost: {
      ptTotalFeeNoFEF: {
        quantity: '4500000',
        tokenId: '',
      },
      ptTotalFee: {
        quantity: '5050000',
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
          quantity: '1050000',
        },
        discountTier: {
          primaryTokenValueThreshold: '100000000',
          secondaryTokenBalanceThreshold: '0',
          variableFeeMultiplier: 0.0005,
          fixedFee: '1000000',
        },
      },
      liquidityFee: {
        tokenId: 'tokenA',
        quantity: '50000',
      },
    },
    buyAmountWithSlippage: {
      quantity: '1148786163',
      tokenId: 'tokenB',
    },
    hasSupply: true,
    prices: {
      base: '0.07101454479564951518',
      market: '0.07101454479564951518',
      withSlippage: '0.08704840223602170946',
      withFees: '0.08112475846386043214',
      withFeesAndSlippage: '0.09013862051540048015',
      difference: '14.236821058705550837',
      withFeesNoFEF: '0.08030215106273002698',
      withFeesAndSlippageNoFEF: '0.0892246122919222522',
      differenceNoFEF: '13.078456383556918976',
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

const mockedOrderCalculations2: SwapOrderCalculation[] = [
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
        quantity: '7335973',
        tokenId: 'tokenA',
      },
    },
    cost: {
      ptTotalFeeNoFEF: {
        quantity: '2950000',
        tokenId: '',
      },
      ptTotalFee: {
        quantity: '2950000',
        tokenId: '',
      },
      batcherFee: {
        quantity: '950000',
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
        quantity: '22008',
      },
    },
    buyAmountWithSlippage: {
      quantity: '90000000',
      tokenId: 'tokenB',
    },
    hasSupply: true,
    prices: {
      base: '0.07214312806368332309',
      market: '0.07214312806368332309',
      withSlippage: '0.08151081111111111111',
      withFees: '0.08285972917140270829',
      withFeesAndSlippage: '0.09206636666666666667',
      difference: '14.854638820567161388',
      withFeesNoFEF: '0.08285972917140270829',
      withFeesAndSlippageNoFEF: '0.09206636666666666667',
      differenceNoFEF: '14.854638820567161388',
    },
    pool: {
      tokenA: {
        quantity: '529504614',
        tokenId: 'tokenA',
      },
      tokenB: {
        quantity: '7339640354',
        tokenId: 'tokenB',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3',
      provider: 'muesliswap_v2',
      batcherFee: {
        quantity: '950000',
        tokenId: '',
      },
      deposit: {
        quantity: '2000000',
        tokenId: '',
      },
      poolId: '1',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    },
  },
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
        quantity: '7006900',
        tokenId: 'tokenA',
      },
    },
    cost: {
      ptTotalFeeNoFEF: {
        quantity: '5050000',
        tokenId: '',
      },
      ptTotalFee: {
        quantity: '5050000',
        tokenId: '',
      },
      batcherFee: {
        quantity: '1900000',
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
        quantity: '21021',
      },
    },
    buyAmountWithSlippage: {
      quantity: '90000000',
      tokenId: 'tokenB',
    },
    hasSupply: true,
    prices: {
      base: '0.06985537222703457584',
      market: '0.06985537222703457584',
      withSlippage: '0.07785444444444444444',
      withFees: '0.08906899910931000891',
      withFeesAndSlippage: '0.09896555555555555556',
      difference: '27.50486651166910406',
      withFeesNoFEF: '0.08906899910931000891',
      withFeesAndSlippageNoFEF: '0.09896555555555555556',
      differenceNoFEF: '27.50486651166910406',
    },
    pool: {
      tokenA: {
        quantity: '143610201719',
        tokenId: 'tokenA',
      },
      tokenB: {
        quantity: '2055821866531',
        tokenId: 'tokenB',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3',
      provider: 'vyfi',
      batcherFee: {
        quantity: '1900000',
        tokenId: '',
      },
      deposit: {
        quantity: '2000000',
        tokenId: '',
      },
      poolId: '2',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    },
  },
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
        quantity: '6974976',
        tokenId: 'tokenA',
      },
    },
    cost: {
      ptTotalFeeNoFEF: {
        quantity: '4000000',
        tokenId: '',
      },
      ptTotalFee: {
        quantity: '4000000',
        tokenId: '',
      },
      batcherFee: {
        quantity: '2000000',
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
        quantity: '20925',
      },
    },
    buyAmountWithSlippage: {
      quantity: '90000000',
      tokenId: 'tokenB',
    },
    hasSupply: true,
    prices: {
      base: '0.06954047650134526242',
      market: '0.06954047650134526242',
      withSlippage: '0.07749973333333333333',
      withFees: '0.08974975910250240897',
      withFeesAndSlippage: '0.09972195555555555556',
      difference: '29.061179356121031793',
      withFeesNoFEF: '0.08974975910250240897',
      withFeesAndSlippageNoFEF: '0.09972195555555555556',
      differenceNoFEF: '29.061179356121031793',
    },
    pool: {
      tokenA: {
        quantity: '27344918300893',
        tokenId: 'tokenA',
      },
      tokenB: {
        quantity: '393223050468514',
        tokenId: 'tokenB',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3',
      provider: 'minswap',
      batcherFee: {
        quantity: '2000000',
        tokenId: '',
      },
      deposit: {
        quantity: '2000000',
        tokenId: '',
      },
      poolId: '3',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    },
  },
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
        quantity: '6947861',
        tokenId: 'tokenA',
      },
    },
    cost: {
      ptTotalFeeNoFEF: {
        quantity: '4000000',
        tokenId: '',
      },
      ptTotalFee: {
        quantity: '4000000',
        tokenId: '',
      },
      batcherFee: {
        quantity: '2000000',
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
        quantity: '24318',
      },
    },
    buyAmountWithSlippage: {
      quantity: '90000000',
      tokenId: 'tokenB',
    },
    hasSupply: true,
    prices: {
      base: '0.06909473936707611128',
      market: '0.06909473936707611128',
      withSlippage: '0.07719845555555555556',
      withFees: '0.08947860910521390895',
      withFeesAndSlippage: '0.09942067777777777778',
      difference: '29.501333856757818526',
      withFeesNoFEF: '0.08947860910521390895',
      withFeesAndSlippageNoFEF: '0.09942067777777777778',
      differenceNoFEF: '29.501333856757818526',
    },
    pool: {
      tokenA: {
        quantity: '3400529909',
        tokenId: 'tokenA',
      },
      tokenB: {
        quantity: '49215467634',
        tokenId: 'tokenB',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.35',
      provider: 'wingriders',
      batcherFee: {
        quantity: '2000000',
        tokenId: '',
      },
      deposit: {
        quantity: '2000000',
        tokenId: '',
      },
      poolId: '4',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    },
  },
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
        quantity: '7044988',
        tokenId: 'tokenA',
      },
    },
    cost: {
      ptTotalFeeNoFEF: {
        quantity: '4500000',
        tokenId: '',
      },
      ptTotalFee: {
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
        quantity: '21135',
      },
    },
    buyAmountWithSlippage: {
      quantity: '90000000',
      tokenId: 'tokenB',
    },
    hasSupply: true,
    prices: {
      base: '0.07019007391821953012',
      market: '0.07019007391821953012',
      withSlippage: '0.07827764444444444444',
      withFees: '0.09544987904550120954',
      withFeesAndSlippage: '0.10605542222222222222',
      difference: '35.987716948001227979',
      withFeesNoFEF: '0.09544987904550120954',
      withFeesAndSlippageNoFEF: '0.10605542222222222222',
      differenceNoFEF: '35.987716948001227979',
    },
    pool: {
      tokenA: {
        quantity: '10178222382',
        tokenId: 'tokenA',
      },
      tokenB: {
        quantity: '145009426744',
        tokenId: 'tokenB',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3',
      provider: 'sundaeswap',
      batcherFee: {
        quantity: '2500000',
        tokenId: '',
      },
      deposit: {
        quantity: '2000000',
        tokenId: '',
      },
      poolId: '5',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    },
  },
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
      ptTotalFeeNoFEF: {
        quantity: '4500000',
        tokenId: '',
      },
      ptTotalFee: {
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
    hasSupply: true,
    prices: {
      base: '0.07101454479564951518',
      market: '0.07101454479564951518',
      withSlippage: '0.07952455555555555556',
      withFees: '0.09657209903427900966',
      withFeesAndSlippage: '0.10730233333333333333',
      difference: '35.989182655713084861',
      withFeesNoFEF: '0.09657209903427900966',
      withFeesAndSlippageNoFEF: '0.10730233333333333333',
      differenceNoFEF: '35.989182655713084861',
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

export const mocks = {
  mockedPools1,
  mockedPools2,
  mockedPools3,
  mockedPools4,
  mockedPools5,

  mockedOrderCalculations1,
  mockedOrderCalculations2,
}
