import {SwapOrderCalculation} from '../../../../types'
import {SwapState} from '../state'

export const selectedPoolCalculationSelector = (
  orderData: SwapState['orderData'],
): SwapOrderCalculation | undefined => {
  const {type, selectedPoolId, calculations, bestPoolCalculation} = orderData
  let calculation: SwapOrderCalculation | undefined

  // can only select a pool if is a limit order type
  // otherwise will return the current state value for it
  if (type === 'limit' && selectedPoolId !== undefined) {
    calculation = calculations.find(({pool}) => pool.poolId === selectedPoolId)
  }

  return calculation ?? bestPoolCalculation
}
