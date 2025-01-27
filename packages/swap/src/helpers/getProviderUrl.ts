import {Swap} from '@yoroi/types'

export const getProviderUrl = (provider: Swap.Provider): string => {
  return (poolUrls[provider] ?? poolUrls[Swap.Provider.Muesliswap_v2]) as string
}

const poolUrls: Record<Swap.Provider, string> = {
  [Swap.Provider.Muesliswap_v2]: 'https://muesliswap.com',
  [Swap.Provider.Muesliswap_clp]: 'https://muesliswap.com',
  [Swap.Provider.Minswap_v1]: 'https://minswap.org',
  [Swap.Provider.Minswap_v2]: 'https://minswap.org',
  [Swap.Provider.Minswap_stable]: 'https://minswap.org',
  [Swap.Provider.Spectrum_v1]: 'https://app.spectrum.fi/cardano',
  [Swap.Provider.Teddy_v1]: 'teddy-v1',
  [Swap.Provider.Wingriders_v1]: 'https://www.wingriders.com',
  [Swap.Provider.Wingriders_v2]: 'https://www.wingriders.com',
  [Swap.Provider.Vyfi_v1]: 'https://app.vyfi.io',
  [Swap.Provider.Sundaeswap_v1]: 'https://sundae.fi',
  [Swap.Provider.Sundaeswap_v3]: 'https://sundae.fi',
  [Swap.Provider.Splash_v1]: 'https://www.splash.trade',
} as const
