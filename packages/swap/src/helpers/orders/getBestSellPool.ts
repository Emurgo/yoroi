import {Balance, Swap} from '@yoroi/types'

import {Quantities} from '../../utils/quantities'
import {getSellAmount} from './getSellAmount'

/**
 * Find the best pool to sell based on the desired sell amount in a liquidity pool.
 *
 * @param pools - The liquidity pool list.
 * @param buy - The desired buy amount.
 *
 * @returns The best pool to sell
 * if the balance in the pool is insuficient it wont throw an error
 * if the pools balance is 0 it will return undefined
 * if the pool list is empty it will return undefined
 */
export const getBestSellPool = (
  pools: Swap.Pool[],
  buy: Balance.Amount,
): Swap.Pool | undefined => {
  if (pools != null && pools.length === 0) {
    return undefined
  }
  let bestPool: Swap.Pool | undefined
  let bestSellAmount = 0n
  for (const pool of pools) {
    const sellAmount = getSellAmount(pool, buy)
    if (Quantities.isZero(sellAmount.quantity)) {
      continue
    }
    if (bestPool === undefined) {
      bestPool = pool
      bestSellAmount = BigInt(sellAmount.quantity)
      continue
    }
    if (BigInt(sellAmount.quantity) < bestSellAmount) {
      bestPool = pool
      bestSellAmount = BigInt(sellAmount.quantity)
    }
  }
  return bestPool
}
