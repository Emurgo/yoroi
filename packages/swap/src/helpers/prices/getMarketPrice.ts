import {Balance, Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'

import {asQuantity} from '../../utils/asQuantity'

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
  sellTokenId: string,
): Balance.Quantity => {
  const isSellTokenA = sellTokenId === pool.tokenA.tokenId

  const A = new BigNumber(pool.tokenA.quantity)
  const B = new BigNumber(pool.tokenB.quantity)

  const [firstToken, secondToken] = isSellTokenA ? [A, B] : [B, A]

  return asQuantity(
    secondToken.isZero() ? 0 : firstToken.dividedBy(secondToken).toString(),
  )
}
