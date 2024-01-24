import {Balance, Swap} from '@yoroi/types'

import {Quantities} from '../../utils/quantities'
import BigNumber from 'bignumber.js'
import {getPriceAfterFee} from '../prices/getPriceAfterFee'
import {getSellAmount} from '../orders/amounts/getSellAmount'

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
  if (pools.length === 0 || Quantities.isZero(buy.quantity)) return undefined

  let bestPool: Swap.Pool | undefined
  let bestPrice = new BigNumber(0)

  for (const pool of pools) {
    const sell = getSellAmount(pool, buy)
    if (Quantities.isZero(sell.quantity)) continue

    const isBuyTokenA = buy.tokenId === pool.tokenA.tokenId
    const [aAmount, bAmount] = isBuyTokenA
      ? [buy.quantity, sell.quantity]
      : [sell.quantity, buy.quantity]
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
