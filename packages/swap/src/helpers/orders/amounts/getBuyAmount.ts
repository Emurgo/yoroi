import {BigNumber} from 'bignumber.js'
import {Portfolio, Swap} from '@yoroi/types'

import {ceilDivision} from '../../../utils/ceilDivision'
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
  sell: Portfolio.Token.Amount,
  buyInfo: Portfolio.Token.Info,
  isLimit?: boolean,
  limit: BigNumber = new BigNumber(0),
): Portfolio.Token.Amount => {
  const isSellTokenA = sell.info.id === pool.tokenA.tokenId

  if (sell.quantity === 0n) return {info: buyInfo, quantity: 0n}

  if (isLimit) {
    const limitPrice = limit.isZero()
      ? getMarketPrice(pool, sell.info.id)
      : limit

    return {
      info: buyInfo,
      quantity: limitPrice.isZero()
        ? 0n
        : BigInt(
            new BigNumber(sell.quantity.toString())
              .dividedToIntegerBy(limitPrice)
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

  const quantity =
    secondToken -
    ceilDivision(firstToken * secondToken, firstToken + sellQuantity - fee)

  return {
    quantity,
    info: buyInfo,
  }
}
