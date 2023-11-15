import {Quantities} from '../../utils/quantities'
import {SwapOrderCalculation} from '../../translators/reactjs/state/state'

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

      if (
        Quantities.isZero(best.prices.withFees) ||
        Quantities.isGreaterThan(best.prices.withFees, current.prices.withFees)
      )
        return current

      return best
    },
    undefined,
  )
}
