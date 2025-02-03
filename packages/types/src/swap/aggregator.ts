import {SwapProtocol} from './protocol'

export const SwapAggregator = Object.freeze({
  Muesliswap: 'muesliswap',
  Dexhunter: 'dexhunter',
} as const)

export type SwapAggregator =
  (typeof SwapAggregator)[keyof typeof SwapAggregator]

export type SwapAggregatorSelected = 'auto' | SwapAggregator

export type SwapAggregatorProtocol = {
  aggregator: SwapAggregator
  protocol: SwapProtocol
}
