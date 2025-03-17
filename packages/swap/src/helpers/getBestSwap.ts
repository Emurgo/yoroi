import {Swap} from '@yoroi/types'

export const getBestSwap =
  (tokenOutPrice: number) =>
  <T extends Swap.EstimateResponse | Swap.CreateResponse>(
    best: T,
    candidate: T,
  ): T => {
    if (
      candidate.totalOutput -
        (tokenOutPrice > 0 ? candidate.totalFee / tokenOutPrice : 0) >
      best.totalOutput - (tokenOutPrice > 0 ? best.totalFee / tokenOutPrice : 0)
    )
      return candidate
    return best
  }
