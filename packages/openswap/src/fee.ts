import {asQuantity} from '@yoroi/swap/src/utils/asQuantity'
import {Quantities} from '@yoroi/swap/src/utils/quantities'
import {ApiDeps, GetFrontedFeeResponse} from './types'
import {Swap} from '@yoroi/types'

export const fetchFrontendFee = async (
  _deps: ApiDeps,
): Promise<GetFrontedFeeResponse> => {
  return {
    muesliswap: {
      tiers,
      lpTokens: {mainnet: milkTokenId.mainnet, preprod: milkTokenId.preprod},
    },
  }
}

const tiers: Swap.DiscountTier[] = [
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
]

const milkTokenId = {
  mainnet: '8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa.4d494c4b',
  preprod: '8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa.4d494c4b',
}
