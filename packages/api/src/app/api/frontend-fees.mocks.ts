/* istanbul ignore file */

import {App} from '@yoroi/types'

const empty: App.FrontendFeesResponse = {} as const

const noFeesAndNoAggregator: App.FrontendFeesResponse = {
  muesliswap: [],
} as const

export const withFees: App.FrontendFeesResponse = {
  muesliswap: [
    // MILK 500+, VALUE ADA 100+, FFEE = 1 ADA + 0.020 %
    {
      primaryTokenValueThreshold: '100000000',
      secondaryTokenBalanceThreshold: '500',
      variableFeeMultiplier: 0.0002,
      fixedFee: '1000000',
    },
    // MILK 100+, VALUE ADA 100+, FFEE = 1 ADA + 0.025 %
    {
      primaryTokenValueThreshold: '100000000',
      secondaryTokenBalanceThreshold: '100',
      variableFeeMultiplier: 0.00025,
      fixedFee: '1000000',
    },
    // VALUE ADA 100+, FFEE = 1 ADA + 0.050 %
    {
      primaryTokenValueThreshold: '100000000',
      secondaryTokenBalanceThreshold: '0',
      variableFeeMultiplier: 0.0005,
      fixedFee: '1000000',
    },
    // VALUE ADA 0-99, FFEE = 0%
  ],
  dexhunter: [
    {
      primaryTokenValueThreshold: '0',
      secondaryTokenBalanceThreshold: '0',
      variableFeeMultiplier: 0.0025,
      fixedFee: '2000000',
    },
  ],
} as const

export const withUnknownAggregator = {
  unknown: [
    {
      primaryTokenValueThreshold: '0',
      secondaryTokenBalanceThreshold: '0',
      variableFeeMultiplier: 0.0025,
      fixedFee: '2000000',
    },
  ],
}

export const withdMalformatdData = {
  unknown: [
    {
      primaryTokenValueThreshold: '0',
      secondaryTokenBalanceThreshold: '0',
      variableFeeMultiplier: '0.0025',
      fixedFee: '2000000',
    },
  ],
}

export const mockGetFrontendFees = {
  empty,
  noFeesAndNoAggregator,
  withFees,
  withUnknownAggregator,
  withdMalformatdData,
} as const
