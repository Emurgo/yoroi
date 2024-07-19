import {Portfolio, Swap} from '@yoroi/types'

import {getBuyAmount} from '../orders/amounts/getBuyAmount'
import {getPriceAfterFee} from '../prices/getPriceAfterFee'
import {BigNumber} from 'bignumber.js'

/**
 * Find the best pool to buy based on the desired sell amount in a liquidity pool.
 *
 * @param pools - The liquidity pool list.
 * @param sell - The desired sell amount.
 * @param buyInfo - The token info of the token to buy.
 *
 * @returns The best pool to sell
 * if the balance in the pool is insuficient it wont throw an error
 * if the pools balance is 0 it will return undefined
 * if the pool list is empty it will return undefined
 */
export const getBestBuyPool = (
  pools: Swap.Pool[],
  sell: Portfolio.Token.Amount,
  buyInfo: Portfolio.Token.Info,
): Swap.Pool | undefined => {
  if (pools.length === 0 || sell.quantity === 0n) return undefined

  let bestPool: Swap.Pool | undefined
  let bestPrice = new BigNumber(0)

  for (const pool of pools) {
    const buy = getBuyAmount(pool, sell, buyInfo)
    if (buy.quantity === 0n) continue

    const isSellTokenA = sell.info.id === pool.tokenA.tokenId
    const [amountA, amountB] = isSellTokenA ? [sell, buy] : [buy, sell]
    const price = getPriceAfterFee(
      pool,
      amountA.quantity,
      amountB.quantity,
      sell.info.id,
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
