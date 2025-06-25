import {Swap} from '@yoroi/types'
import {freeze} from 'immer'

export const dexUrls: Readonly<Record<Swap.Dex, string>> = freeze({
  [Swap.Dex.Minswap]: 'https://minswap.org',
  [Swap.Dex.Muesliswap]: 'https://muesliswap.com',
  [Swap.Dex.Spectrum]: 'https://app.spectrum.fi/cardano',
  [Swap.Dex.Sundaeswap]: 'https://sundae.fi',
  [Swap.Dex.Teddy]: 'http://app.teddyswap.org',
  [Swap.Dex.Vyfi]: 'https://app.vyfi.io',
  [Swap.Dex.Wingriders]: 'https://www.wingriders.com',
  [Swap.Dex.Splash]: 'https://www.splash.trade',
  [Swap.Dex.Cswap]: 'https://www.cswap.info',
  [Swap.Dex.Unsupported]: '',
} as const)
