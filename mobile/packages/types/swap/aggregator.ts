export const SwapAggregator = Object.freeze({
  Muesliswap: 'muesliswap',
  Dexhunter: 'dexhunter',
  Minswap: 'minswap',
} as const)

export type SwapAggregator =
  (typeof SwapAggregator)[keyof typeof SwapAggregator]
