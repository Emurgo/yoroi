import {Balance, Swap} from '@yoroi/types'

import {Quantities} from '../../utils/quantities'
import BigNumber from 'bignumber.js'
import {getPriceAfterFee} from './getPriceAfterFee'
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
  if (pools.length === 0) {
    return undefined
  }
  let bestPool: Swap.Pool | undefined
  let bestPrice = new BigNumber(0)
  for (const pool of pools) {
    const isBuyTokenA = buy.tokenId === pool.tokenA.tokenId
    const sellAmount = getSellAmount(pool, buy)
    if (Quantities.isZero(sellAmount.quantity)) {
      continue
    }
    const [aAmount, bAmount] = isBuyTokenA
      ? [buy.quantity, sellAmount.quantity]
      : [sellAmount.quantity, buy.quantity]

    const price = getPriceAfterFee(
      pool,
      aAmount,
      bAmount,
      isBuyTokenA ? pool.tokenB.tokenId : pool.tokenA.tokenId,
    )

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
