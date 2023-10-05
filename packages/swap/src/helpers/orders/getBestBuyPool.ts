import {Balance, Swap} from '@yoroi/types'

import {Quantities} from '../../utils/quantities'
import {getBuyAmount} from './getBuyAmount'
import {getPriceAfterFee} from './getPriceAfterFee'
import BigNumber from 'bignumber.js'

/**
 * Find the best pool to buy based on the desired sell amount in a liquidity pool.
 *
 * @param pools - The liquidity pool list.
 * @param sell - The desired sell amount.
 *
 * @returns The best pool to sell
 * if the balance in the pool is insuficient it wont throw an error
 * if the pools balance is 0 it will return undefined
 * if the pool list is empty it will return undefined
 */
export const getBestBuyPool = (
  pools: Swap.Pool[],
  sell: Balance.Amount,
): Swap.Pool | undefined => {
  if (pools != null && pools.length === 0) {
    return undefined
  }
  let bestPool: Swap.Pool | undefined
  let bestPrice = new BigNumber(0)
  for (const pool of pools) {
    const isSellTokenA = sell.tokenId === pool.tokenA.tokenId
    const buyAmount = getBuyAmount(pool, sell)
    if (Quantities.isZero(buyAmount.quantity)) {
      continue
    }
    const [aAmount, bAmount] = isSellTokenA
      ? [sell.quantity, buyAmount.quantity]
      : [buyAmount.quantity, sell.quantity]

    const price = getPriceAfterFee(pool, aAmount, bAmount, sell.tokenId)
    if (bestPool === undefined) {
      bestPool = pool
      bestPrice = price
      continue
    }

    if (price < bestPrice) {
      bestPool = pool
      bestPrice = price
    }
  }
  return bestPool
}
