export const SwapDex = {
  Minswap: 'minswap',
  Muesliswap: 'muesliswap',
  Spectrum: 'spectrum',
  Sundaeswap: 'sundaeswap',
  Teddy: 'teddy',
  Vyfi: 'vyfi',
  Wingriders: 'wingriders',
  Splash: 'splash',
  Cswap: 'cswap',
  Unsupported: 'unsupported',
} as const

export type SwapDex = (typeof SwapDex)[keyof typeof SwapDex]
