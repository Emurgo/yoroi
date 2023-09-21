import {Balance, Swap} from '@yoroi/types'

import {ceilDivision} from '../../utils/ceilDivision'

/**
 * Calculate the amount to buy based on the desired sell amount in a liquidity pool.
 *
 * @param pool - The liquidity pool.
 * @param sell - The desired sell amount.
 *
 * @returns The calculated buy amount
 * if the balance in the pool is insuficient it wont throw an error
 */
export const getBuyAmount = (
  pool: Swap.Pool,
  sell: Balance.Amount,
  limit?: Balance.Quantity,
): Balance.Amount => {
  const isSellTokenA = sell.tokenId === pool.tokenA.tokenId

  const tokenId = isSellTokenA ? pool.tokenB.tokenId : pool.tokenA.tokenId

  const B = BigInt(pool.tokenB.quantity)
  const A =
    !limit || Number(limit) === 0
      ? BigInt(pool.tokenA.quantity)
      : BigInt(Math.floor(Number(B) / Number(limit)))

  const [firstToken, secondToken] = isSellTokenA ? [A, B] : [B, A]

  const sellQuantity = BigInt(sell.quantity)

  const fee = ceilDivision(
    BigInt(Number(pool.fee) * 1000) * sellQuantity,
    BigInt(100 * 1000),
  )

  const quantity = (
    secondToken -
    ceilDivision(firstToken * secondToken, firstToken + sellQuantity - fee)
  ).toString() as Balance.Quantity

  return {
    quantity,
    tokenId,
  }
}
