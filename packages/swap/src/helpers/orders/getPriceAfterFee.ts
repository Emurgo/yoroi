import {Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'

import {BalanceQuantity} from '@yoroi/types/src/balance/token'

/**
 * Calculate the price with batcher fee in a liquidity pool.
 *
 * @param pool - The liquidity pool.
 * @param tokenAAmount - Token A amount in an order.
 * @param tokenBAmount - Token B amount in an order.
 * @param sellTokenId - The token id of the desired sell amount.
 *
 * @returns The price after fee
 */
export const getPriceAfterFee = (
  pool: Swap.Pool,
  tokenAAmount: BalanceQuantity,
  tokenBAmount: BalanceQuantity,
  sellTokenId: string,
): BigNumber => {
  const isSellTokenA = sellTokenId === pool.tokenA.tokenId

  const A = new BigNumber(tokenAAmount)
  const B = new BigNumber(tokenBAmount)

  const [firstToken, secondToken] = isSellTokenA ? [A, B] : [B, A]
  const sellTokenPriceLovelace = new BigNumber(
    isSellTokenA ? pool.ptPriceTokenA : pool.ptPriceTokenB,
  )

  const feeInTokenEquivalent = sellTokenPriceLovelace.isZero()
    ? new BigNumber(0)
    : new BigNumber(pool.batcherFee.quantity).dividedBy(sellTokenPriceLovelace)

  const firstTokenWithFee = firstToken.plus(feeInTokenEquivalent)

  return secondToken.isZero()
    ? new BigNumber(0)
    : firstTokenWithFee.dividedBy(secondToken)
}
