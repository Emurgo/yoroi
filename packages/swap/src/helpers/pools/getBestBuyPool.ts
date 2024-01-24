import {Balance, Swap} from '@yoroi/types'

import {Quantities} from '../../utils/quantities'
import {getBuyAmount} from '../orders/amounts/getBuyAmount'
import {getPriceAfterFee} from '../prices/getPriceAfterFee'
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
  if (pools.length === 0 || Quantities.isZero(sell.quantity)) return undefined

  let bestPool: Swap.Pool | undefined
  let bestPrice = new BigNumber(0)

  for (const pool of pools) {
    const buy = getBuyAmount(pool, sell)
    if (Quantities.isZero(buy.quantity)) continue

    const isSellTokenA = sell.tokenId === pool.tokenA.tokenId
    const [amountA, amountB] = isSellTokenA ? [sell, buy] : [buy, sell]
    const price = getPriceAfterFee(
      pool,
      amountA.quantity,
      amountB.quantity,
      sell.tokenId,
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
