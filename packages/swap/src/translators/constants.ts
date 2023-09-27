import {Swap} from '@yoroi/types'

export const supportedProviders: ReadonlyArray<Swap.SupportedProvider> = [
  'minswap',
  'wingriders',
  'sundaeswap',
  'muesliswap',
  'muesliswap_v2',
  'vyfi',
] as const
