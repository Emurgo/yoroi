import BigNumber from 'bignumber.js'
import {Balance, Swap} from '@yoroi/types'

import {ceilDivision} from '../../../utils/ceilDivision'
import {Quantities} from '../../../utils/quantities'
import {asQuantity} from '../../../utils/asQuantity'
import {getMarketPrice} from '../../prices/getMarketPrice'

/**
 * Calculate the amount to sell based on the desired buy amount in a liquidity pool.
 *
 * @param pool - The liquidity pool.
 * @param buy - The desired buy amount.
 * @param isLimit - Optional limit type.
 * @param limit - Optional limit price.
 *
 * @returns The calculated sell amount
 * if the balance in the pool is insuficient it wont throw an error
 */
export const getSellAmount = (
  pool: Swap.Pool,
  buy: Balance.Amount,
  isLimit?: boolean,
  limit: Balance.Quantity = Quantities.zero,
): Balance.Amount => {
  const isBuyTokenA = buy.tokenId === pool.tokenA.tokenId

  const tokenId = isBuyTokenA ? pool.tokenB.tokenId : pool.tokenA.tokenId

  if (Quantities.isZero(buy.quantity))
    return {tokenId, quantity: Quantities.zero}

  if (isLimit) {
    const limitPrice = Quantities.isZero(limit)
      ? getMarketPrice(pool, tokenId)
      : limit

    return {
      tokenId,
      quantity: Quantities.isZero(limitPrice)
        ? Quantities.zero
        : asQuantity(
            new BigNumber(buy.quantity)
              .times(new BigNumber(limitPrice))
              .integerValue(BigNumber.ROUND_CEIL)
              .toString(),
          ),
    }
  }

  const A = BigInt(pool.tokenA.quantity)
  const B = BigInt(pool.tokenB.quantity)

  const [firstToken, secondToken] = isBuyTokenA ? [A, B] : [B, A]

  const buyQuantity = BigInt(buy.quantity)

  const fee = BigInt(100 * 1000) - BigInt(Number(pool.fee) * 1000)

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
