import {Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'

export const getBestPoolCalculation = (
  calculations: Array<Swap.OrderCalculation>,
): Swap.OrderCalculation | undefined => {
  return calculations.reduce(
    (
      best: Swap.OrderCalculation | undefined,
      current,
    ): Swap.OrderCalculation | undefined => {
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
