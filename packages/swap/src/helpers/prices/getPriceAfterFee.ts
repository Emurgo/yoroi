import {Balance, Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import {Quantities} from '../../utils/quantities'

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
  quantityA: Balance.Quantity,
  quantityB: Balance.Quantity,
  sellTokenId: string,
): BigNumber => {
  if (Quantities.isZero(quantityA) || Quantities.isZero(quantityB))
    return new BigNumber(0)

  const A = new BigNumber(quantityA)
  const B = new BigNumber(quantityB)

  const isSellTokenA = sellTokenId === pool.tokenA.tokenId
  const [dividend, divisor] = isSellTokenA ? [A, B] : [B, A]
  const sellPriceInPtTerm = isSellTokenA
    ? new BigNumber(pool.ptPriceTokenA)
    : new BigNumber(pool.ptPriceTokenB)

  const feeInSellTerm = sellPriceInPtTerm.isZero()
    ? new BigNumber(0)
    : new BigNumber(pool.batcherFee.quantity).dividedBy(sellPriceInPtTerm)

  return dividend.plus(feeInSellTerm).dividedBy(divisor)
}
