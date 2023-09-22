import {Balance, Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'

import {asQuantity} from '../../utils/asQuantity'

/**
 * Calculate the market price based on the desired sell amount in a liquidity pool.
 *
 * @param pool - The liquidity pool.
 * @param sell - The desired sell amount.
 * @param buy - The desired buy amount.
 *
 * @returns The market price
 */
export const getMarketPrice = (
  pool: Swap.Pool,
  sell: Balance.Amount,
): Balance.Quantity => {
  const isSellTokenA = sell.tokenId === pool.tokenA.tokenId

  const B = new BigNumber(pool.tokenB.quantity)
  const A = new BigNumber(pool.tokenA.quantity)

  const [firstToken, secondToken] = isSellTokenA ? [A, B] : [B, A]

  return asQuantity(
    firstToken.isZero() ? 0 : secondToken.dividedBy(firstToken).toString(),
  )
}
