import {SwapState} from '../state'

export const limitPriceSelector = (orderData: SwapState['orderData']) => {
  const {type, limitPrice} = orderData

  return type === 'limit' ? limitPrice : undefined
}
