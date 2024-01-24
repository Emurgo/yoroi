import {Balance, Swap} from '@yoroi/types'

import {getBuyAmount} from '../amounts/getBuyAmount'
import {getQuantityWithSlippage} from '../amounts/getQuantityWithSlippage'

/**
 * Create a possible market order choosing the best pool based on the given parameters.
 *
 * @param sell - The amount to sell.
 * @param buy - The desired buy amount.
 * @param bestPool - best liquidity pool.
 * @param slippage - Maximum acceptable slippage in percentage.
 * @param address - The address placing the order.
 *
 * @returns The best market order data
 */
export const makePossibleMarketOrder = (
  sell: Balance.Amount,
  buy: Balance.Amount,
  bestPool: Readonly<Swap.Pool>,
  slippage: number,
  address: string,
): Swap.CreateOrderData | undefined => {
  const rawBuy = getBuyAmount(bestPool, sell)

  const buyQuantityWithSlippage = getQuantityWithSlippage(
    rawBuy.quantity,
    slippage,
  )

  const newOrder: Swap.CreateOrderData = {
    selectedPool: bestPool,
    slippage,
    amounts: {
      sell,
      buy: {
        tokenId: buy.tokenId,
        quantity: buyQuantityWithSlippage,
      },
    },
    address,
  }

  return newOrder
}
