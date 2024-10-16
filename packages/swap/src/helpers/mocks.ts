import {Swap} from '@yoroi/types'

import {tokenInfoMocks} from '../tokenInfo.mocks'

const mockedPools1: Swap.Pool[] = [
  {
    tokenA: {quantity: 529504614n, tokenId: 'tokenA.'},
    tokenB: {quantity: 7339640354n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.3', // 0.3%
    provider: 'muesliswap_v2',
    batcherFee: {quantity: 950000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '1',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenA: {quantity: 143610201719n, tokenId: 'tokenA.'},
    tokenB: {quantity: 2055821866531n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.3', // 0.3%
    provider: 'vyfi',
    batcherFee: {quantity: 1900000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '2',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenA: {quantity: 27344918300893n, tokenId: 'tokenA.'},
    tokenB: {quantity: 393223050468514n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.3', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: 2000000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '3',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenA: {quantity: 3400529909n, tokenId: 'tokenA.'},
    tokenB: {quantity: 49215467634n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.35', // 0.35%
    provider: 'wingriders',
    batcherFee: {quantity: 2000000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '4',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenA: {quantity: 10178222382n, tokenId: 'tokenA.'},
    tokenB: {quantity: 145009426744n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.3', // 0.3%
    provider: 'sundaeswap',
    batcherFee: {quantity: 2500000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '5',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenA: {quantity: 973669994n, tokenId: 'tokenA.'},
    tokenB: {quantity: 13710853133n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.05', // 0.05%
    provider: 'sundaeswap',
    batcherFee: {quantity: 2500000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '6',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
]

const mockedPools2: Swap.Pool[] = [
  {
    tokenA: {quantity: 529504614n, tokenId: 'tokenA.'},
    tokenB: {quantity: 7339640354n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.3', // 0.3%
    provider: 'muesliswap_v2',
    batcherFee: {quantity: 950000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },

  {
    tokenA: {quantity: 143610201719n, tokenId: 'tokenA.'},
    tokenB: {quantity: 2055821866531n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.3', // 0.3%
    provider: 'vyfi',
    batcherFee: {quantity: 1900000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },

  {
    tokenA: {quantity: 27344918300893n, tokenId: 'tokenA.'},
    tokenB: {quantity: 393223050468514n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.3', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: 2000000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },

  {
    tokenA: {quantity: 3400529909n, tokenId: 'tokenA.'},
    tokenB: {quantity: 49215467634n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.35', // 0.35%
    provider: 'wingriders',
    batcherFee: {quantity: 2000000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },

  {
    tokenA: {quantity: 10178222382n, tokenId: 'tokenA.'},
    tokenB: {quantity: 145009426744n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.3', // 0.3%
    provider: 'sundaeswap',
    batcherFee: {quantity: 2500000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },

  {
    tokenA: {quantity: 973669994n, tokenId: 'tokenA.'},
    tokenB: {quantity: 13710853133n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.05', // 0.05%
    provider: 'sundaeswap',
    batcherFee: {quantity: 2500000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
]
const mockedPools3: Swap.Pool[] = [
  {
    tokenA: {quantity: 529504614n, tokenId: 'tokenA.'},
    tokenB: {quantity: 7339640354n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.06950020009',
    fee: '0.3', // 0.3%
    provider: 'muesliswap_v2',
    batcherFee: {quantity: 950000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenA: {quantity: 143610201719n, tokenId: 'tokenA.'},
    tokenB: {quantity: 2055821866531n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.06950020009',
    fee: '0.3', // 0.3%
    provider: 'vyfi',
    batcherFee: {quantity: 1900000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenA: {quantity: 27337840212697n, tokenId: 'tokenA.'},
    tokenB: {quantity: 393349086430693n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.06950020009',
    fee: '0.3', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: 2000000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenA: {quantity: 3400529909n, tokenId: 'tokenA.'},
    tokenB: {quantity: 49215467634n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.06950020009',
    fee: '0.35', // 0.35%
    provider: 'wingriders',
    batcherFee: {quantity: 2000000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenA: {quantity: 10178222382n, tokenId: 'tokenA.'},
    tokenB: {quantity: 145009426744n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.06950020009',
    fee: '0.3', // 0.3%
    provider: 'sundaeswap',
    batcherFee: {quantity: 2500000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenA: {quantity: 973669994n, tokenId: 'tokenA.'},
    tokenB: {quantity: 13710853133n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.06950020009',
    fee: '0.05', // 0.05%
    provider: 'sundaeswap',
    batcherFee: {quantity: 2500000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
]
const mockedPools4: Swap.Pool[] = [
  {
    tokenB: {quantity: 529504614n, tokenId: 'tokenB.'},
    tokenA: {quantity: 7339640354n, tokenId: 'tokenA.'},
    ptPriceTokenB: '1',
    ptPriceTokenA: '0.06950020009',
    fee: '0.3', // 0.3%
    provider: 'muesliswap_v2',
    batcherFee: {quantity: 950000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenB: {quantity: 143610201719n, tokenId: 'tokenB.'},
    tokenA: {quantity: 2055821866531n, tokenId: 'tokenA.'},
    ptPriceTokenB: '1',
    ptPriceTokenA: '0.06950020009',
    fee: '0.3', // 0.3%
    provider: 'vyfi',
    batcherFee: {quantity: 1900000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenB: {quantity: 27337840212697n, tokenId: 'tokenB.'},
    tokenA: {quantity: 393349086430693n, tokenId: 'tokenA.'},
    ptPriceTokenB: '1',
    ptPriceTokenA: '0.06950020009',
    fee: '0.3', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: 2000000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenB: {quantity: 3400529909n, tokenId: 'tokenB.'},
    tokenA: {quantity: 49215467634n, tokenId: 'tokenA.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.06950020009',
    fee: '0.35', // 0.35%
    provider: 'wingriders',
    batcherFee: {quantity: 2000000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenB: {quantity: 10178222382n, tokenId: 'tokenB.'},
    tokenA: {quantity: 145009426744n, tokenId: 'tokenA.'},
    ptPriceTokenB: '1',
    ptPriceTokenA: '0.06950020009',
    fee: '0.3', // 0.3%
    provider: 'sundaeswap',
    batcherFee: {quantity: 2500000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenB: {quantity: 973669994n, tokenId: 'tokenB.'},
    tokenA: {quantity: 13710853133n, tokenId: 'tokenA.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.06950020009',
    fee: '0.05', // 0.05%
    provider: 'sundaeswap',
    batcherFee: {quantity: 2500000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
]

const mockedPools5: Swap.Pool[] = [
  {
    tokenA: {quantity: 27019025551205n, tokenId: 'tokenA.'},
    tokenB: {quantity: 403657459031350n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.06693552899',
    fee: '0.3', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: 2000000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenB: {quantity: 27019025551205n, tokenId: 'tokenB.'},
    tokenA: {quantity: 403657459031350n, tokenId: 'tokenA.'},
    ptPriceTokenB: '1',
    ptPriceTokenA: '0.06693552899',
    fee: '0.3', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: 2000000n, tokenId: '.'},
    deposit: {quantity: 2000000n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenA: {quantity: 10000n, tokenId: 'tokenA.'},
    tokenB: {quantity: 10100n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '1',
    fee: '0', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: 0n, tokenId: '.'},
    deposit: {quantity: 0n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenA: {quantity: 0n, tokenId: 'tokenA.'},
    tokenB: {quantity: 0n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '1',
    fee: '0', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: 0n, tokenId: '.'},
    deposit: {quantity: 0n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenA: {quantity: 1n, tokenId: 'tokenA.'},
    tokenB: {quantity: 1n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '1',
    fee: '0', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: 0n, tokenId: '.'},
    deposit: {quantity: 0n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenA: {quantity: 0n, tokenId: 'tokenA.'},
    tokenB: {quantity: 1n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '1',
    fee: '0', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: 0n, tokenId: '.'},
    deposit: {quantity: 0n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenA: {quantity: 1n, tokenId: 'tokenA.'},
    tokenB: {quantity: 0n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '1',
    fee: '0', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: 0n, tokenId: '.'},
    deposit: {quantity: 0n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenA: {quantity: 10000000000n, tokenId: 'tokenA.'},
    tokenB: {quantity: 10000000000n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '1',
    fee: '0', // 0.3%
    provider: 'minswap',
    batcherFee: {quantity: 0n, tokenId: '.'},
    deposit: {quantity: 0n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
]

const mockedPools6: Swap.Pool[] = [
  {
    tokenA: {quantity: 100n, tokenId: 'tokenA.'},
    tokenB: {quantity: 200n, tokenId: 'tokenB.'},
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.5',
    fee: '0',
    provider: 'vyfi',
    batcherFee: {quantity: 0n, tokenId: '.'},
    deposit: {quantity: 0n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: 'no.token',
    },
  },
  {
    tokenB: {quantity: 100n, tokenId: 'tokenB.'},
    tokenA: {quantity: 200n, tokenId: 'tokenA.'},
    ptPriceTokenB: '0.5',
    ptPriceTokenA: '1',
    fee: '0',
    provider: 'minswap',
    batcherFee: {quantity: 0n, tokenId: '.'},
    deposit: {quantity: 0n, tokenId: '.'},
    poolId: '1',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
]

const mockedPools7: Swap.Pool[] = [
  {
    tokenA: {quantity: 100n, tokenId: 'tokenA.'},
    tokenB: {quantity: 200n, tokenId: 'tokenB.'},
    ptPriceTokenA: '0',
    ptPriceTokenB: '1',
    fee: '0',
    provider: 'vyfi',
    batcherFee: {quantity: 0n, tokenId: '.'},
    deposit: {quantity: 0n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: 'no.token',
    },
  },
  {
    tokenB: {quantity: 100n, tokenId: 'tokenB.'},
    tokenA: {quantity: 200n, tokenId: 'tokenA.'},
    ptPriceTokenB: '0',
    ptPriceTokenA: '1',
    fee: '0',
    provider: 'minswap',
    batcherFee: {quantity: 0n, tokenId: '.'},
    deposit: {quantity: 0n, tokenId: '.'},
    poolId: '1',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
]

const mockedPools8: Swap.Pool[] = [
  {
    tokenA: {quantity: 1000n, tokenId: 'tokenA.'},
    tokenB: {quantity: 1000n, tokenId: 'tokenB.'},
    ptPriceTokenA: '0',
    ptPriceTokenB: '0',
    fee: '0',
    provider: 'vyfi',
    batcherFee: {quantity: 0n, tokenId: '.'},
    deposit: {quantity: 0n, tokenId: '.'},
    poolId: '0',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
  {
    tokenB: {quantity: 1000n, tokenId: 'tokenB.'},
    tokenA: {quantity: 1000n, tokenId: 'tokenA.'},
    ptPriceTokenB: '0',
    ptPriceTokenA: '0',
    fee: '50',
    provider: 'minswap',
    batcherFee: {quantity: 0n, tokenId: '.'},
    deposit: {quantity: 0n, tokenId: '.'},
    poolId: '1',
    lpToken: {
      quantity: 0n,
      tokenId: '0.',
    },
  },
]

const mockedOrderCalculations1: Swap.OrderCalculation[] = [
  {
    order: {
      side: 'sell',
      slippage: 10,
      orderType: 'market',
      amounts: {
        sell: {
          quantity: 100000000n,
          info: tokenInfoMocks.a,
        },
        buy: {
          quantity: 0n,
          info: tokenInfoMocks.b,
        },
      },
    },
    sides: {
      buy: {
        quantity: 1162995513n,
        info: tokenInfoMocks.b,
      },
      sell: {
        quantity: 100000000n,
        info: tokenInfoMocks.a,
      },
    },
    cost: {
      ptTotalRequired: {
        quantity: 3050000n,
        info: tokenInfoMocks.pt,
      },
      batcherFee: {
        quantity: 950000n,
        info: tokenInfoMocks.pt,
      },
      deposit: {
        quantity: 2000000n,
        info: tokenInfoMocks.pt,
      },
      frontendFeeInfo: {
        fee: {
          info: tokenInfoMocks.pt,
          quantity: 1050000n,
        },
        discountTier: {
          primaryTokenValueThreshold: '100000000',
          secondaryTokenBalanceThreshold: '0',
          variableFeeMultiplier: 0.0005,
          fixedFee: '1000000',
        },
      },
      liquidityFee: {
        info: tokenInfoMocks.a,
        quantity: 300000n,
      },
    },
    buyAmountWithSlippage: {
      quantity: 1046695961n,
      info: tokenInfoMocks.b,
    },
    hasSupply: true,
    prices: {
      base: '0.07214312806368332309',
      market: '0.07214312806368332309',
      actualPrice: '0',
      withSlippage: '0.09553872731529533436',
      withFees: '0.08770455161678684826',
      withFeesAndSlippage: '0.09744950186160124105',
      difference: '21.570209070179074072',
      priceImpact: '0.0',
    },
    pool: {
      tokenA: {
        quantity: 529504614n,
        tokenId: 'tokenA.',
      },
      tokenB: {
        quantity: 7339640354n,
        tokenId: 'tokenB.',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3',
      provider: 'muesliswap_v2',
      batcherFee: {
        quantity: 950000n,
        tokenId: '.',
      },
      deposit: {
        quantity: 2000000n,
        tokenId: '.',
      },
      poolId: '1',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
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
          quantity: 100000000n,
          info: tokenInfoMocks.a,
        },
        buy: {
          quantity: 0n,
          info: tokenInfoMocks.b,
        },
      },
    },
    sides: {
      buy: {
        quantity: 1426244382n,
        info: tokenInfoMocks.b,
      },
      sell: {
        quantity: 100000000n,
        info: tokenInfoMocks.a,
      },
    },
    cost: {
      ptTotalRequired: {
        quantity: 4950000n,
        info: tokenInfoMocks.pt,
      },
      batcherFee: {
        quantity: 1900000n,
        info: tokenInfoMocks.pt,
      },
      deposit: {
        quantity: 2000000n,
        info: tokenInfoMocks.pt,
      },
      frontendFeeInfo: {
        fee: {
          info: tokenInfoMocks.pt,
          quantity: 1050000n,
        },
        discountTier: {
          primaryTokenValueThreshold: '100000000',
          secondaryTokenBalanceThreshold: '0',
          variableFeeMultiplier: 0.0005,
          fixedFee: '1000000',
        },
      },
      liquidityFee: {
        info: tokenInfoMocks.a,
        quantity: 300000n,
      },
    },
    buyAmountWithSlippage: {
      quantity: 1283619943n,
      info: tokenInfoMocks.b,
    },
    hasSupply: true,
    prices: {
      base: '0.06985537222703457584',
      market: '0.06985537222703457584',
      actualPrice: '0',
      withSlippage: '0.07790467929805294401',
      withFees: '0.07218258055862406896',
      withFeesAndSlippage: '0.08020286733734550586',
      difference: '3.33146651058691987',
      priceImpact: '0.0',
    },
    pool: {
      tokenA: {
        quantity: 143610201719n,
        tokenId: 'tokenA.',
      },
      tokenB: {
        quantity: 2055821866531n,
        tokenId: 'tokenB.',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3',
      provider: 'vyfi',
      batcherFee: {
        quantity: 1900000n,
        tokenId: '.',
      },
      deposit: {
        quantity: 2000000n,
        tokenId: '.',
      },
      poolId: '2',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
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
          quantity: 100000000n,
          info: tokenInfoMocks.a,
        },
        buy: {
          quantity: 0n,
          info: tokenInfoMocks.b,
        },
      },
    },
    sides: {
      buy: {
        quantity: 1433692167n,
        info: tokenInfoMocks.b,
      },
      sell: {
        quantity: 100000000n,
        info: tokenInfoMocks.a,
      },
    },
    cost: {
      ptTotalRequired: {
        quantity: 5050000n,
        info: tokenInfoMocks.pt,
      },
      batcherFee: {
        quantity: 2000000n,
        info: tokenInfoMocks.pt,
      },
      deposit: {
        quantity: 2000000n,
        info: tokenInfoMocks.pt,
      },
      frontendFeeInfo: {
        fee: {
          info: tokenInfoMocks.pt,
          quantity: 1050000n,
        },
        discountTier: {
          primaryTokenValueThreshold: '100000000',
          secondaryTokenBalanceThreshold: '0',
          variableFeeMultiplier: 0.0005,
          fixedFee: '1000000',
        },
      },
      liquidityFee: {
        info: tokenInfoMocks.a,
        quantity: 300000n,
      },
    },
    buyAmountWithSlippage: {
      quantity: 1290322950n,
      info: tokenInfoMocks.b,
    },
    hasSupply: true,
    prices: {
      base: '0.06954047650134526242',
      market: '0.06954047650134526242',
      actualPrice: '0',
      withSlippage: '0.07749997781563135028',
      withFees: '0.0718773544083958157',
      withFeesAndSlippage: '0.07986372713900810646',
      difference: '3.360457138951796387',
      priceImpact: '0.0',
    },
    pool: {
      tokenA: {
        quantity: 27344918300893n,
        tokenId: 'tokenA.',
      },
      tokenB: {
        quantity: 393223050468514n,
        tokenId: 'tokenB.',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3',
      provider: 'minswap',
      batcherFee: {
        quantity: 2000000n,
        tokenId: '.',
      },
      deposit: {
        quantity: 2000000n,
        tokenId: '.',
      },
      poolId: '3',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
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
          quantity: 100000000n,
          info: tokenInfoMocks.a,
        },
        buy: {
          quantity: 0n,
          info: tokenInfoMocks.b,
        },
      },
    },
    sides: {
      buy: {
        quantity: 1401162647n,
        info: tokenInfoMocks.b,
      },
      sell: {
        quantity: 100000000n,
        info: tokenInfoMocks.a,
      },
    },
    cost: {
      ptTotalRequired: {
        quantity: 5050000n,
        info: tokenInfoMocks.pt,
      },
      batcherFee: {
        quantity: 2000000n,
        info: tokenInfoMocks.pt,
      },
      deposit: {
        quantity: 2000000n,
        info: tokenInfoMocks.pt,
      },
      frontendFeeInfo: {
        fee: {
          info: tokenInfoMocks.pt,
          quantity: 1050000n,
        },
        discountTier: {
          primaryTokenValueThreshold: '100000000',
          secondaryTokenBalanceThreshold: '0',
          variableFeeMultiplier: 0.0005,
          fixedFee: '1000000',
        },
      },
      liquidityFee: {
        info: tokenInfoMocks.a,
        quantity: 350000n,
      },
    },
    buyAmountWithSlippage: {
      quantity: 1261046382n,
      info: tokenInfoMocks.b,
    },
    hasSupply: true,
    prices: {
      base: '0.06909473936707611128',
      market: '0.06909473936707611128',
      actualPrice: '0',
      withSlippage: '0.07929922438015448031',
      withFees: '0.07354606563387783488',
      withFeesAndSlippage: '0.08171785072374919196',
      difference: '6.44235191792733844',
      priceImpact: '0.0',
    },
    pool: {
      tokenA: {
        quantity: 3400529909n,
        tokenId: 'tokenA.',
      },
      tokenB: {
        quantity: 49215467634n,
        tokenId: 'tokenB.',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.35',
      provider: 'wingriders',
      batcherFee: {
        quantity: 2000000n,
        tokenId: '.',
      },
      deposit: {
        quantity: 2000000n,
        tokenId: '.',
      },
      poolId: '4',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
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
          quantity: 100000000n,
          info: tokenInfoMocks.a,
        },
        buy: {
          quantity: 0n,
          info: tokenInfoMocks.b,
        },
      },
    },
    sides: {
      buy: {
        quantity: 1406650031n,
        info: tokenInfoMocks.b,
      },
      sell: {
        quantity: 100000000n,
        info: tokenInfoMocks.a,
      },
    },
    cost: {
      ptTotalRequired: {
        quantity: 5050000n,
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
          quantity: 1050000n,
        },
        discountTier: {
          primaryTokenValueThreshold: '100000000',
          secondaryTokenBalanceThreshold: '0',
          variableFeeMultiplier: 0.0005,
          fixedFee: '1000000',
        },
      },
      liquidityFee: {
        info: tokenInfoMocks.a,
        quantity: 300000n,
      },
    },
    buyAmountWithSlippage: {
      quantity: 1265985027n,
      info: tokenInfoMocks.b,
    },
    hasSupply: true,
    prices: {
      base: '0.07019007391821953012',
      market: '0.07019007391821953012',
      actualPrice: '0',
      withSlippage: '0.07898987576256697703',
      withFees: '0.07361461466459101084',
      withFeesAndSlippage: '0.08179401635213810471',
      difference: '4.878953041653028379',
      priceImpact: '0.0',
    },
    pool: {
      tokenA: {
        quantity: 10178222382n,
        tokenId: 'tokenA.',
      },
      tokenB: {
        quantity: 145009426744n,
        tokenId: 'tokenB.',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3',
      provider: 'sundaeswap',
      batcherFee: {
        quantity: 2500000n,
        tokenId: '.',
      },
      deposit: {
        quantity: 2000000n,
        tokenId: '.',
      },
      poolId: '5',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
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
          quantity: 100000000n,
          info: tokenInfoMocks.a,
        },
        buy: {
          quantity: 0n,
          info: tokenInfoMocks.b,
        },
      },
    },
    sides: {
      buy: {
        quantity: 1276429070n,
        info: tokenInfoMocks.b,
      },
      sell: {
        quantity: 100000000n,
        info: tokenInfoMocks.a,
      },
    },
    cost: {
      ptTotalRequired: {
        quantity: 5050000n,
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
          quantity: 1050000n,
        },
        discountTier: {
          primaryTokenValueThreshold: '100000000',
          secondaryTokenBalanceThreshold: '0',
          variableFeeMultiplier: 0.0005,
          fixedFee: '1000000',
        },
      },
      liquidityFee: {
        info: tokenInfoMocks.a,
        quantity: 50000n,
      },
    },
    buyAmountWithSlippage: {
      quantity: 1148786163n,
      info: tokenInfoMocks.b,
    },
    hasSupply: true,
    prices: {
      base: '0.07101454479564951518',
      market: '0.07101454479564951518',
      actualPrice: '0',
      withSlippage: '0.08704840223602170946',
      withFees: '0.08112475846386043214',
      withFeesAndSlippage: '0.09013862051540048015',
      difference: '14.236821058705550837',
      priceImpact: '0.0',
    },
    pool: {
      tokenA: {
        quantity: 973669994n,
        tokenId: 'tokenA.',
      },
      tokenB: {
        quantity: 13710853133n,
        tokenId: 'tokenB.',
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

const mockedOrderCalculations2: Swap.OrderCalculation[] = [
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
        quantity: 7335973n,
        info: tokenInfoMocks.a,
      },
    },
    cost: {
      ptTotalRequired: {
        quantity: 2950000n,
        info: tokenInfoMocks.pt,
      },
      batcherFee: {
        quantity: 950000n,
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
        quantity: 22008n,
      },
    },
    buyAmountWithSlippage: {
      quantity: 90000000n,
      info: tokenInfoMocks.b,
    },
    hasSupply: true,
    prices: {
      base: '0.07214312806368332309',
      market: '0.07214312806368332309',
      actualPrice: '0',
      withSlippage: '0.08151081111111111111',
      withFees: '0.08285972917140270829',
      withFeesAndSlippage: '0.09206636666666666667',
      difference: '14.854638820567161388',
      priceImpact: '0.0',
    },
    pool: {
      tokenA: {
        quantity: 529504614n,
        tokenId: 'tokenA.',
      },
      tokenB: {
        quantity: 7339640354n,
        tokenId: 'tokenB.',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3',
      provider: 'muesliswap_v2',
      batcherFee: {
        quantity: 950000n,
        tokenId: '.',
      },
      deposit: {
        quantity: 2000000n,
        tokenId: '.',
      },
      poolId: '1',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
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
        quantity: 7006900n,
        info: tokenInfoMocks.a,
      },
    },
    cost: {
      ptTotalRequired: {
        quantity: 5050000n,
        info: tokenInfoMocks.pt,
      },
      batcherFee: {
        quantity: 1900000n,
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
        quantity: 21021n,
      },
    },
    buyAmountWithSlippage: {
      quantity: 90000000n,
      info: tokenInfoMocks.b,
    },
    hasSupply: true,
    prices: {
      base: '0.06985537222703457584',
      market: '0.06985537222703457584',
      actualPrice: '0',
      withSlippage: '0.07785444444444444444',
      withFees: '0.08906899910931000891',
      withFeesAndSlippage: '0.09896555555555555556',
      difference: '27.50486651166910406',
      priceImpact: '0.0',
    },
    pool: {
      tokenA: {
        quantity: 143610201719n,
        tokenId: 'tokenA.',
      },
      tokenB: {
        quantity: 2055821866531n,
        tokenId: 'tokenB.',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3',
      provider: 'vyfi',
      batcherFee: {
        quantity: 1900000n,
        tokenId: '.',
      },
      deposit: {
        quantity: 2000000n,
        tokenId: '.',
      },
      poolId: '2',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
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
        quantity: 6974976n,
        info: tokenInfoMocks.a,
      },
    },
    cost: {
      ptTotalRequired: {
        quantity: 4000000n,
        info: tokenInfoMocks.pt,
      },
      batcherFee: {
        quantity: 2000000n,
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
        quantity: 20925n,
      },
    },
    buyAmountWithSlippage: {
      quantity: 90000000n,
      info: tokenInfoMocks.b,
    },
    hasSupply: true,
    prices: {
      base: '0.06954047650134526242',
      market: '0.06954047650134526242',
      actualPrice: '0',
      withSlippage: '0.07749973333333333333',
      withFees: '0.08974975910250240897',
      withFeesAndSlippage: '0.09972195555555555556',
      difference: '29.061179356121031793',
      priceImpact: '0.0',
    },
    pool: {
      tokenA: {
        quantity: 27344918300893n,
        tokenId: 'tokenA.',
      },
      tokenB: {
        quantity: 393223050468514n,
        tokenId: 'tokenB.',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3',
      provider: 'minswap',
      batcherFee: {
        quantity: 2000000n,
        tokenId: '.',
      },
      deposit: {
        quantity: 2000000n,
        tokenId: '.',
      },
      poolId: '3',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
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
        quantity: 6947861n,
        info: tokenInfoMocks.a,
      },
    },
    cost: {
      ptTotalRequired: {
        quantity: 4000000n,
        info: tokenInfoMocks.pt,
      },
      batcherFee: {
        quantity: 2000000n,
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
        quantity: 24318n,
      },
    },
    buyAmountWithSlippage: {
      quantity: 90000000n,
      info: tokenInfoMocks.b,
    },
    hasSupply: true,
    prices: {
      base: '0.06909473936707611128',
      market: '0.06909473936707611128',
      actualPrice: '0',
      withSlippage: '0.07719845555555555556',
      withFees: '0.08947860910521390895',
      withFeesAndSlippage: '0.09942067777777777778',
      difference: '29.501333856757818526',
      priceImpact: '0.0',
    },
    pool: {
      tokenA: {
        quantity: 3400529909n,
        tokenId: 'tokenA.',
      },
      tokenB: {
        quantity: 49215467634n,
        tokenId: 'tokenB.',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.35',
      provider: 'wingriders',
      batcherFee: {
        quantity: 2000000n,
        tokenId: '.',
      },
      deposit: {
        quantity: 2000000n,
        tokenId: '.',
      },
      poolId: '4',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
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
        quantity: 7044988n,
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
        quantity: 21135n,
      },
    },
    buyAmountWithSlippage: {
      quantity: 90000000n,
      info: tokenInfoMocks.b,
    },
    hasSupply: true,
    prices: {
      base: '0.07019007391821953012',
      market: '0.07019007391821953012',
      actualPrice: '0',
      withSlippage: '0.07827764444444444444',
      withFees: '0.09544987904550120954',
      withFeesAndSlippage: '0.10605542222222222222',
      difference: '35.987716948001227979',
      priceImpact: '0.0',
    },
    pool: {
      tokenA: {
        quantity: 10178222382n,
        tokenId: 'tokenA.',
      },
      tokenB: {
        quantity: 145009426744n,
        tokenId: 'tokenB.',
      },
      ptPriceTokenA: '1',
      ptPriceTokenB: '0.0695404765',
      fee: '0.3',
      provider: 'sundaeswap',
      batcherFee: {
        quantity: 2500000n,
        tokenId: '.',
      },
      deposit: {
        quantity: 2000000n,
        tokenId: '.',
      },
      poolId: '5',
      lpToken: {
        quantity: 0n,
        tokenId: '0.',
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
    hasSupply: true,
    prices: {
      base: '0.07101454479564951518',
      market: '0.07101454479564951518',
      actualPrice: '0',
      withSlippage: '0.07952455555555555556',
      withFees: '0.09657209903427900966',
      withFeesAndSlippage: '0.10730233333333333333',
      difference: '35.989182655713084861',
      priceImpact: '0.0',
    },
    pool: {
      tokenA: {
        quantity: 973669994n,
        tokenId: 'tokenA.',
      },
      tokenB: {
        quantity: 13710853133n,
        tokenId: 'tokenB.',
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

export const mocks = {
  mockedPools1,
  mockedPools2,
  mockedPools3,
  mockedPools4,
  mockedPools5,
  mockedPools6,
  mockedPools7,
  mockedPools8,

  mockedOrderCalculations1,
  mockedOrderCalculations2,
}
