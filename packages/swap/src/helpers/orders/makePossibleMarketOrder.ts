import {Balance, Swap} from '@yoroi/types'
import {getBuyAmount} from './getBuyAmount'
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
  sell: Balance.Amount,
  buy: Balance.Amount,
  pools: Swap.Pool[],
  slippage: number,
  address: string,
): Swap.CreateOrderData | undefined => {
  if (pools.length === 0) return undefined

  const findBestOrder = (
    bestOrder: Swap.CreateOrderData | undefined,
    currentPool: Swap.Pool,
  ): Swap.CreateOrderData => {
    const rawBuy = getBuyAmount(currentPool, sell)

    const rawBuyQuantity = BigInt(rawBuy.quantity)
    const buyQuantityWithSlippage = getQuantityWithSlippage(
      rawBuyQuantity,
      BigInt(slippage),
    )

    const newOrder: Swap.CreateOrderData = {
      selectedPool: currentPool,
      slippage,
      amounts: {
        sell,
        buy: {
          tokenId: buy.tokenId,
          quantity: buyQuantityWithSlippage.toString() as Balance.Quantity,
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
