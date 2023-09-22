import {Balance, Swap} from '@yoroi/types'

import {ceilDivision} from '../../utils/ceilDivision'
import {Quantities} from '../../utils/quantities'
import {asQuantity} from '../../utils/asQuantity'

const LIMIT_WITHOUT_FEE = true

/**
 * Calculate the amount to sell based on the desired buy amount in a liquidity pool.
 *
 * @param pool - The liquidity pool.
 * @param buy - The desired buy amount.
 * @param limit - Optional limit value.
 *
 * @returns The calculated sell amount
 * if the balance in the pool is insuficient it wont throw an error
 */
export const getSellAmount = (
  pool: Swap.Pool,
  buy: Balance.Amount,
  limit?: Balance.Quantity,
): Balance.Amount => {
  const notLimit = !limit || Quantities.isZero(limit)
  const isBuyTokenA = buy.tokenId === pool.tokenA.tokenId

  const tokenId = isBuyTokenA ? pool.tokenB.tokenId : pool.tokenA.tokenId

  if (Quantities.isZero(buy.quantity))
    return {tokenId, quantity: Quantities.zero}

  const B = BigInt(pool.tokenB.quantity)
  const A = notLimit
    ? BigInt(pool.tokenA.quantity)
    : BigInt(Math.floor(Number(B) / Number(limit)))

  const [firstToken, secondToken] = isBuyTokenA ? [A, B] : [B, A]

  const buyQuantity = BigInt(buy.quantity)

  const poolFee = !notLimit && LIMIT_WITHOUT_FEE ? 0 : pool.fee
  const fee = BigInt(100 * 1000) - BigInt(Number(poolFee) * 1000)

  const maxBuyQuantity =
    firstToken -
    (firstToken > buyQuantity ? buyQuantity : firstToken - BigInt(1))

  const quantity = asQuantity(
    ceilDivision(
      (ceilDivision(firstToken * secondToken + maxBuyQuantity, maxBuyQuantity) -
        secondToken) *
        BigInt(100 * 1000),
      fee,
    ).toString(),
  )

  return {
    quantity,
    tokenId,
  }
}
