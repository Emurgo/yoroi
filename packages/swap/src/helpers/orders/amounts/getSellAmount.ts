import {BigNumber} from 'bignumber.js'
import {Portfolio, Swap} from '@yoroi/types'

import {ceilDivision} from '../../../utils/ceilDivision'
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
  buy: Portfolio.Token.Amount,
  sellInfo: Portfolio.Token.Info,
  isLimit?: boolean,
  limit: BigNumber = new BigNumber(0),
): Portfolio.Token.Amount => {
  const isBuyTokenA = buy.info.id === pool.tokenA.tokenId
  const tokenId = isBuyTokenA ? pool.tokenB.tokenId : pool.tokenA.tokenId

  if (buy.quantity === 0n) return {info: sellInfo, quantity: 0n}

  if (isLimit) {
    const limitPrice = limit.isZero() ? getMarketPrice(pool, tokenId) : limit

    return {
      info: sellInfo,
      quantity: limitPrice.isZero()
        ? 0n
        : BigInt(
            new BigNumber(buy.quantity.toString())
              .times(limitPrice)
              .integerValue(BigNumber.ROUND_CEIL)
              .toString(),
          ),
    }
  }

  const A = BigInt(pool.tokenA.quantity)
  const B = BigInt(pool.tokenB.quantity)

  const [firstToken, secondToken] = isBuyTokenA ? [A, B] : [B, A]

  const buyQuantity = BigInt(buy.quantity)

  const fee = BigInt(100 * 1_000) - BigInt(Number(pool.fee) * 1_000)

  const maxBuyQuantity =
    firstToken -
    (firstToken > buyQuantity ? buyQuantity : firstToken - BigInt(1))

  const quantity = ceilDivision(
    (ceilDivision(firstToken * secondToken + maxBuyQuantity, maxBuyQuantity) -
      secondToken) *
      BigInt(100 * 1_000),
    fee,
  )

  return {
    quantity,
    info: sellInfo,
  }
}
