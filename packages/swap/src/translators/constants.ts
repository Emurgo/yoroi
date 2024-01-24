import {Swap} from '@yoroi/types'

// openswap supported providers
export const supportedProviders: ReadonlyArray<Swap.SupportedProvider> = [
  'minswap',
  'wingriders',
  'sundaeswap',
  'muesliswap',
  'muesliswap_v2',
  'vyfi',
] as const

// openswap discount tokens
export const milkTokenId = {
  mainnet: '8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa.4d494c4b',
  preprod: '8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa.4d494c4b',
} as const
