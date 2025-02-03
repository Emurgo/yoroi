import {Swap} from '@yoroi/types'

export const getBestSwap = <
  T extends Swap.EstimateResponse | Swap.CreateResponse,
>(
  best: T,
  candidate: T,
): T => {
  // TODO: Could use more logic to account for fees
  if (candidate.totalOutput > best.totalOutput) return candidate
  return best
}
