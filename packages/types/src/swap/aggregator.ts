export const SwapAggregator = Object.freeze({
  Muesliswap: 'muesliswap',
  Dexhunter: 'dexhunter',
} as const)

export type SwapAggregator =
  (typeof SwapAggregator)[keyof typeof SwapAggregator]
