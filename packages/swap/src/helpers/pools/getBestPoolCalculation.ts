import BigNumber from 'bignumber.js'
import {SwapOrderCalculation} from '../../types'

export const getBestPoolCalculation = (
  calculations: ReadonlyArray<SwapOrderCalculation>,
): SwapOrderCalculation | undefined => {
  return calculations.reduce(
    (
      best: SwapOrderCalculation | undefined,
      current,
    ): SwapOrderCalculation | undefined => {
      if (!current.hasSupply) return best

      if (best === undefined) return current

      const bestWithFees = new BigNumber(best.prices.withFees)

      if (
        bestWithFees.isZero() ||
        bestWithFees.isGreaterThan(current.prices.withFees)
      )
        return current

      return best
    },
    undefined,
  )
}
