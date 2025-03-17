import {isRight} from '@yoroi/common'
import {Portfolio, Swap} from '@yoroi/types'

const CACHE_TIMEOUT = 5 * 60 * 1000 // 5 minutes in milliseconds

export const getPtPrice = (
  primaryTokenInfo: Portfolio.Token.Info,
  api: Swap.Api,
) => {
  const priceCache: Record<
    Portfolio.Token.Id,
    {price: number; timestamp: number}
  > = {}

  return async (id: Portfolio.Token.Id) => {
    if (primaryTokenInfo.id === id) return 1

    const cached = priceCache[id]
    const now = Date.now()

    if (cached && now - cached.timestamp < CACHE_TIMEOUT) {
      return cached.price
    }

    const price = await api
      .estimate({
        tokenIn: primaryTokenInfo.id,
        tokenOut: id,
        amountIn: 50,
        slippage: 0,
      })
      .then((res) => (isRight(res) ? res.value.data.netPrice : 0))

    priceCache[id] = {price, timestamp: now}
    return price
  }
}
