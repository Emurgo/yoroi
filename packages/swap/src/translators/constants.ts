import {Swap} from '@yoroi/types'

export const supportedProtocols: ReadonlyArray<Swap.SupportedProvider> = [
  'minswap',
  'wingriders',
  'sundaeswap',
  'muesliswap',
  'muesliswap_v2',
  'vyfi',
] as const
