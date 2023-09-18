import {Portfolio, Swap} from '@yoroi/types'
import {getBuyAmountbyChangingSell} from './getBuyAmountByChangingSell'
import {getQuantityWithSlippage} from './getQuantityWithSlippage'

/**
 * Create a possible market order choosing the best pool based on the given parameters.
 *
 * @param sell - The amount to sell.
 * @param buy - The desired buy amount.
 * @param pools - Array of liquidity pools to choose from.
 * @param slippage - Maximum acceptable slippage in percentage.
 * @param address - The address placing the order.
 *
 * @returns The best market order data, or undefined if no pool is available.
 */
export const makePossibleMarketOrder = (
  sell: Portfolio.Amount,
  buy: Portfolio.Amount,
  pools: Swap.Pool[],
  slippage: number,
  address: string,
): Swap.CreateOrderData | undefined => {
  if (pools.length === 0) return undefined

  const findBestOrder = (
    bestOrder: Swap.CreateOrderData | undefined,
    currentPool: Swap.Pool,
  ): Swap.CreateOrderData => {
    const amountPair = getBuyAmountbyChangingSell(currentPool, sell)

    const rawReceiveAmount = BigInt(amountPair.buy.quantity)
    const receiveAmountWithSlippage = getQuantityWithSlippage(
      rawReceiveAmount,
      BigInt(slippage),
    )

    const newOrder: Swap.CreateOrderData = {
      selectedPool: currentPool,
      slippage,
      amounts: {
        sell: amountPair.sell,
        buy: {
          tokenId: buy.tokenId,
          quantity: receiveAmountWithSlippage.toString() as Portfolio.Quantity,
        },
      },
      address,
    }

    if (
      bestOrder === undefined ||
      BigInt(bestOrder.amounts.buy.quantity) <
        BigInt(newOrder.amounts.buy.quantity)
    ) {
      return newOrder
    }

    return bestOrder
  }

  return pools.reduce(findBestOrder, undefined)
}
