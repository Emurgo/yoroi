export type SwapOrderType = 'market' | 'limit'

export type SwapSlippageOptions =
  | '0'
  | '0.1'
  | '0.5'
  | '1'
  | '2'
  | '3'
  | 'Manual'

export type SwapProtocol =
  | 'minswap'
  | 'sundaeswap'
  | 'wingriders'
  | 'muesliswap'
