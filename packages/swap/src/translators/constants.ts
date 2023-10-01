import {Balance, Swap} from '@yoroi/types'

import {asQuantity} from '../utils/asQuantity'
import {Quantities} from '../utils/quantities'

export const supportedProviders: ReadonlyArray<Swap.SupportedProvider> = [
  'minswap',
  'wingriders',
  'sundaeswap',
  'muesliswap',
  'muesliswap_v2',
  'vyfi',
] as const

export type DiscountTier = {
  primaryTokenValueThreshold: Balance.Quantity // primary token trade value threshold
  secondaryTokenBalanceThreshold: Balance.Quantity // secodary token balance (holding)
  variableFeeMultiplier: number
  variableFeeVisual: number
  fixedFee: Balance.Quantity
}

// table of discounts based on MILK token holdings + value in ADA
export const milkHoldersDiscountTiers: ReadonlyArray<DiscountTier> = [
  // MILK 500+, VALUE ADA 100+, FFEE = 1 ADA + 0.020 %
  {
    primaryTokenValueThreshold: asQuantity(100_000_000),
    secondaryTokenBalanceThreshold: '500',
    variableFeeMultiplier: 0.0002,
    variableFeeVisual: 0.02,
    fixedFee: asQuantity(1_000_000),
  },
  // MILK 100+, VALUE ADA 100+, FFEE = 1 ADA + 0.025 %
  {
    primaryTokenValueThreshold: asQuantity(100_000_000),
    secondaryTokenBalanceThreshold: '100',
    variableFeeMultiplier: 0.00025,
    variableFeeVisual: 0.025,
    fixedFee: asQuantity(1_000_000),
  },
  // VALUE ADA 100+, FFEE = 1 ADA + 0.050 %
  {
    primaryTokenValueThreshold: asQuantity(100_000_000),
    secondaryTokenBalanceThreshold: Quantities.zero,
    variableFeeMultiplier: 0.0005,
    variableFeeVisual: 0.05,
    fixedFee: asQuantity(1_000_000),
  },
  // VALUE ADA 0-99, FFEE = 0%
  {
    primaryTokenValueThreshold: Quantities.zero,
    secondaryTokenBalanceThreshold: Quantities.zero,
    variableFeeMultiplier: 0.0,
    variableFeeVisual: 0.0,
    fixedFee: Quantities.zero,
  },
] as const

export const milkTokenId = {
  mainnet: '8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa.4d494c4b',
  preprod: '8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa.4d494c4b',
} as const
