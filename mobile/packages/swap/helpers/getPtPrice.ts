import {isRight, time} from '@yoroi/common'
import {Portfolio, Swap} from '@yoroi/types'

export const getPtPrice = (
  primaryTokenInfo: Portfolio.Token.Info,
  api: Swap.Api,
) => {
  // TODO: react-query now has persistance, we can drop it here and move to client.
  const priceCache: Record<
    Portfolio.Token.Id,
    {price: number; timestamp: number}
  > = {}

  return async (id: Portfolio.Token.Id) => {
    if (primaryTokenInfo.id === id) return 1

    const cached = priceCache[id]
    const now = Date.now()

    if (cached && now - cached.timestamp < time.minutes(5)) {
      return cached.price
    }

    const price = await api
      .estimate({
        tokenIn: primaryTokenInfo.id,
        tokenOut: id,
        // NOTE: arbritraty to return a price
        amountIn: 50,
        slippage: 0,
      })
      .then((res) => (isRight(res) ? res.value.data.netPrice : 0))

    priceCache[id] = {price, timestamp: now}
    return price
  }
}
