import {Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'

import {BalanceQuantity} from '@yoroi/types/src/balance/token'

/**
 * Calculate the price with batcher fee in a liquidity pool.
 *
 * @param pool - The liquidity pool.
 * @param tokenAAmount - Token A amount in an order.
 * @param tokenBAmount - Token B amount in an order.
 * @param tokenId - The token id of the desired sell amount.
 *
 * @returns The price after fee
 */
export const getPriceAfterFee = (
  pool: Swap.Pool,
  tokenAAmount: BalanceQuantity,
  tokenBAmount: BalanceQuantity,
  tokenId: string,
): BigNumber => {
  const isSellTokenA = tokenId === pool.tokenA.tokenId

  const A = new BigNumber(tokenAAmount)
  const B = new BigNumber(tokenBAmount)

  const [firstToken, secondToken] = isSellTokenA ? [A, B] : [B, A]
  const sellTokenPriceLovlace = new BigNumber(
    isSellTokenA ? pool.tokenAPriceLovelace : pool.tokenBPriceLovelace,
  )

  const feeInTokenEquivalent = sellTokenPriceLovlace.isZero()
    ? new BigNumber(0)
    : new BigNumber(pool.batcherFee.quantity).dividedBy(sellTokenPriceLovlace)

  const firstTokenWithFee = firstToken.plus(feeInTokenEquivalent)

  return secondToken.isZero()
    ? new BigNumber(0)
    : firstTokenWithFee.dividedBy(secondToken)
}
