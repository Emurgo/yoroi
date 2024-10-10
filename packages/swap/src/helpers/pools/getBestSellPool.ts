import {Portfolio, Swap} from '@yoroi/types'

import {BigNumber} from 'bignumber.js'
import {getPriceAfterFee} from '../prices/getPriceAfterFee'
import {getSellAmount} from '../orders/amounts/getSellAmount'

/**
 * Find the best pool to sell based on the desired sell amount in a liquidity pool.
 *
 * @param pools - The liquidity pool list.
 * @param buy - The desired buy amount.
 * @param sellInfo - The token info of the token to sell.
 *
 * @returns The best pool to sell
 * if the balance in the pool is insuficient it wont throw an error
 * if the pools balance is 0 it will return undefined
 * if the pool list is empty it will return undefined
 */
export const getBestSellPool = (
  pools: Swap.Pool[],
  buy: Portfolio.Token.Amount,
  sellInfo: Portfolio.Token.Info,
): Swap.Pool | undefined => {
  if (pools.length === 0 || buy.quantity === 0n) return undefined

  let bestPool: Swap.Pool | undefined
  let bestPrice = new BigNumber(0)

  for (const pool of pools) {
    const sell = getSellAmount(pool, buy, sellInfo)
    if (sell.quantity === 0n) continue

    const isBuyTokenA = buy.info.id === pool.tokenA.tokenId
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
