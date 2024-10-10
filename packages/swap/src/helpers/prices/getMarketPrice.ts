import {Portfolio, Swap} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'

/**
 * Calculate the market price based on the desired sell amount in a liquidity pool.
 *
 * @param pool - The liquidity pool.
 * @param sellTokenId - The desired sell token id.
 *
 * @returns The market price
 */
export const getMarketPrice = (
  pool: Swap.Pool,
  sellTokenId: Portfolio.Token.Id,
) => {
  const isSellTokenA = sellTokenId === pool.tokenA.tokenId

  const A = new BigNumber(pool.tokenA.quantity.toString())
  const B = new BigNumber(pool.tokenB.quantity.toString())

  const [firstToken, secondToken] = isSellTokenA ? [A, B] : [B, A]

  return secondToken.isZero() ? secondToken : firstToken.dividedBy(secondToken)
}
