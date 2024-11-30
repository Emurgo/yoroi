import {Provider} from '../adapters/api/muesliswap/types'

export const getPoolUrlByProvider = (provider: Provider): string => {
  return (poolUrls[provider] ?? poolUrls[Provider.Muesliswap_v2]) as string
}

const poolUrls: Record<Provider, string> = {
  [Provider.Muesliswap_v2]: 'https://muesliswap.com',
  [Provider.Minswap_v1]: 'https://minswap.org',
  [Provider.Minswap_v2]: 'https://minswap.org',
  [Provider.Spectrum_v1]: 'https://app.spectrum.fi/cardano',
  [Provider.Teddy_v1]: 'teddy-v1',
  [Provider.Wingriders_v1]: 'https://www.wingriders.com',
  [Provider.Vyfi_v1]: 'https://app.vyfi.io',
  [Provider.Sundaeswap_v1]: 'https://sundae.fi',
  [Provider.Sundaeswap_v3]: 'https://sundae.fi',
} as const
