import BigNumber from 'bignumber.js'
import {Balance, Swap} from '@yoroi/types'

import {ceilDivision} from '../../../utils/ceilDivision'
import {Quantities} from '../../../utils/quantities'
import {asQuantity} from '../../../utils/asQuantity'
import {getMarketPrice} from '../../prices/getMarketPrice'

/**
 * Calculate the amount to buy based on the desired sell amount in a liquidity pool.
 *
 * @param pool - The liquidity pool.
 * @param sell - The desired sell amount.
 * @param isLimit - Optional limit type.
 * @param limit - Optional limit price
 *
 * @returns The calculated buy amount
 * if the balance in the pool is insuficient it wont throw an error
 */
export const getBuyAmount = (
  pool: Swap.Pool,
  sell: Balance.Amount,
  isLimit?: boolean,
  limit: Balance.Quantity = Quantities.zero,
): Balance.Amount => {
  const isSellTokenA = sell.tokenId === pool.tokenA.tokenId

  const tokenId = isSellTokenA ? pool.tokenB.tokenId : pool.tokenA.tokenId

  if (Quantities.isZero(sell.quantity))
    return {tokenId, quantity: Quantities.zero}

  if (isLimit) {
    const limitPrice = Quantities.isZero(limit)
      ? getMarketPrice(pool, sell.tokenId)
      : limit

    return {
      tokenId,
      quantity: Quantities.isZero(limitPrice)
        ? Quantities.zero
        : asQuantity(
            new BigNumber(sell.quantity)
              .dividedToIntegerBy(new BigNumber(limitPrice))
              .toString(),
          ),
    }
  }

  const A = BigInt(pool.tokenA.quantity)
  const B = BigInt(pool.tokenB.quantity)

  const [firstToken, secondToken] = isSellTokenA ? [A, B] : [B, A]

  const sellQuantity = BigInt(sell.quantity)

  const fee = ceilDivision(
    BigInt(Number(pool.fee) * 1000) * sellQuantity,
    BigInt(100 * 1000),
  )

  const quantity = asQuantity(
    (
      secondToken -
      ceilDivision(firstToken * secondToken, firstToken + sellQuantity - fee)
    ).toString(),
  )

  return {
    quantity,
    tokenId,
  }
}
