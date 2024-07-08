import {Portfolio, Swap} from '@yoroi/types'
import {getQuantityWithSlippage} from '../amounts/getQuantityWithSlippage'

/**
 * Create a limit order with specified parameters.
 *
 * @param sell - The amount to sell.
 * @param buy - The amount to buy.
 * @param pool - The liquidity pool to use for the swap.
 * @param slippage - The maximum acceptable slippage percentage.
 * @param address - The address placing the order.
 *
 * @returns The created limit order data.
 */
export const makeLimitOrder = (
  sell: Portfolio.Token.Amount,
  buy: Portfolio.Token.Amount,
  pool: Swap.Pool,
  slippage: number,
  address: string,
): Swap.CreateOrderData => {
  if (slippage < 0 || slippage > 100)
    throw new Error('Invalid slippage percentage')

  const quantity = getQuantityWithSlippage(buy.quantity, slippage)

  return {
    selectedPool: pool,
    address,
    slippage,
    amounts: {
      sell: {
        tokenId: sell.info.id,
        quantity: sell.quantity,
      },
      buy: {
        tokenId: buy.info.id,
        quantity,
      },
    },
  }
}
