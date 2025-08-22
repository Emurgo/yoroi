export const SwapProtocol = Object.freeze({
  Cswap: 'cswap',
  Minswap_v1: 'minswap-v1',
  Minswap_v2: 'minswap-v2',
  Minswap_stable: 'minswap-stable',
  Muesliswap_v2: 'muesliswap-v2',
  Muesliswap_clp: 'muesliswap-clp',
  Spectrum_v1: 'spectrum-v1',
  Sundaeswap_v1: 'sundaeswap-v1',
  Sundaeswap_v3: 'sundaeswap-v3',
  Teddy_v1: 'teddy-v1',
  Vyfi_v1: 'vyfi-v1',
  Wingriders_v1: 'wingriders-v1',
  Wingriders_v2: 'wingriders-v2',
  Splash_v1: 'splash-v1',
  Unsupported: 'unsupported',
} as const)

export type SwapProtocol = (typeof SwapProtocol)[keyof typeof SwapProtocol]
