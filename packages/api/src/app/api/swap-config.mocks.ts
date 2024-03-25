/* istanbul ignore file */

import {App} from '@yoroi/types'

const empty: App.SwapConfigResponse = {
  aggregators: {},
  liquidityProvidersEnabled: [],
  isSwapEnabled: false,
} as const

export const withFees: App.SwapConfigResponse = {
  aggregators: {
    muesliswap: {
      isEnabled: true,
      discountTokenId:
        'afbe91c0b44b3040e360057bf8354ead8c49c4979ae6ab7c4fbdc9eb.4d494c4b7632',
      frontendFeeTiers: [
        {
          primaryTokenValueThreshold: '100000000',
          secondaryTokenBalanceThreshold: '5000',
          variableFeeMultiplier: 0.00015,
          fixedFee: '1000000',
        },
        {
          primaryTokenValueThreshold: '100000000',
          secondaryTokenBalanceThreshold: '2000',
          variableFeeMultiplier: 0.0002,
          fixedFee: '1000000',
        },
        {
          primaryTokenValueThreshold: '100000000',
          secondaryTokenBalanceThreshold: '1000',
          variableFeeMultiplier: 0.00025,
          fixedFee: '1000000',
        },
        {
          primaryTokenValueThreshold: '100000000',
          secondaryTokenBalanceThreshold: '500',
          variableFeeMultiplier: 0.0003,
          fixedFee: '1000000',
        },
        {
          primaryTokenValueThreshold: '100000000',
          secondaryTokenBalanceThreshold: '100',
          variableFeeMultiplier: 0.00035,
          fixedFee: '1000000',
        },
        {
          primaryTokenValueThreshold: '100000000',
          secondaryTokenBalanceThreshold: '0',
          variableFeeMultiplier: 0.0005,
          fixedFee: '1000000',
        },
      ],
    },
    dexhunter: {
      isEnabled: false,
      discountTokenId:
        '95a427e384527065f2f8946f5e86320d0117839a5e98ea2c0b55fb00.48554e54',
      frontendFeeTiers: [],
    },
  },
  liquidityProvidersEnabled: [
    'minswap',
    'wingriders',
    'sundaeswap',
    'muesliswap',
    'muesliswap_v2',
    'vyfi',
  ],
  isSwapEnabled: true,
}

export const mockGetSwapConfig = {
  empty,
  withFees,
} as const
