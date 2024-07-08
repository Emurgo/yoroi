import {Swap} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'

/**
 * Calculate the price with batcher fee in a liquidity pool.
 *
 * @param pool - The liquidity pool.
 * @param quantityA - Token A amount in an order.
 * @param quantityB - Token B amount in an order.
 * @param sellTokenId - The token id of the desired sell amount.
 *
 * @returns The price after fee
 */
export const getPriceAfterFee = (
  pool: Swap.Pool,
  quantityA: bigint,
  quantityB: bigint,
  sellTokenId: string,
): BigNumber => {
  if (quantityA === 0n || quantityB === 0n) return new BigNumber(0)

  const A = new BigNumber(quantityA.toString())
  const B = new BigNumber(quantityB.toString())

  const isSellTokenA = sellTokenId === pool.tokenA.tokenId
  const [dividend, divisor] = isSellTokenA ? [A, B] : [B, A]
  const sellPriceInPtTerm = isSellTokenA
    ? new BigNumber(pool.ptPriceTokenA)
    : new BigNumber(pool.ptPriceTokenB)

  const feeInSellTerm = sellPriceInPtTerm.isZero()
    ? new BigNumber(0)
    : new BigNumber(pool.batcherFee.quantity.toString()).dividedBy(
        sellPriceInPtTerm,
      )

  return dividend.plus(feeInSellTerm).dividedBy(divisor)
}
