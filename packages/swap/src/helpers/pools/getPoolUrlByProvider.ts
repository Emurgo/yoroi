import {Swap} from '@yoroi/types'

export const getPoolUrlByProvider = (provider: Swap.PoolProvider): string => {
  return (poolUrls[provider] ?? poolUrls.muesliswap_v1) as string
}

const poolUrls: Record<Swap.PoolProvider, string> = {
  minswap: 'https://minswap.org',
  sundaeswap: 'https://sundae.fi',
  wingriders: 'https://www.wingriders.com',
  muesliswap: 'https://muesliswap.com',
  muesliswap_v1: 'https://muesliswap.com',
  muesliswap_v2: 'https://muesliswap.com',
  muesliswap_v3: 'https://muesliswap.com',
  muesliswap_v4: 'https://muesliswap.com',
  vyfi: 'https://app.vyfi.io',
  spectrum: 'https://app.spectrum.fi/cardano',
} as const
