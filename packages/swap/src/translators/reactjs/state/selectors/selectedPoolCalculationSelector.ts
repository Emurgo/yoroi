import {Swap} from '@yoroi/types'

export const selectedPoolCalculationSelector = ({
  type,
  selectedPoolId,
  calculations,
  bestPoolCalculation,
}: {
  type: Swap.OrderType
  selectedPoolId?: string
  calculations: Array<Swap.OrderCalculation>
  bestPoolCalculation?: Swap.OrderCalculation
}): Swap.OrderCalculation | undefined => {
  let calculation: Swap.OrderCalculation | undefined

  // can only select a pool if is a limit order type
  // otherwise will return the current state value for it
  if (type === 'limit' && selectedPoolId !== undefined) {
    calculation = calculations.find(({pool}) => pool.poolId === selectedPoolId)
  }

  return calculation ?? bestPoolCalculation
}
