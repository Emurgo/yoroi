import {Swap} from '@yoroi/types'

export const supported_protocols: ReadonlyArray<Swap.SupportedProtocol> = [
  'minswap',
  'wingriders',
  'sundaeswap',
  'muesliswap',
  'muesliswap_v2',
  'vyfi',
] as const
