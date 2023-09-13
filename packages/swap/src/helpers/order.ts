import {Balance, Swap} from '@yoroi/types'

type AmountPair = {
  sell: Balance.Amount
  buy: Balance.Amount
}

export const getReceiveAmountbyChangingSell = (
  pool: Swap.Pool,
  sell: Balance.Amount,
): AmountPair => {
  const poolA = BigInt(pool.tokenA.quantity)
  const poolB = BigInt(pool.tokenB.quantity)
  const poolsProduct = poolA * poolB // fee is part of tokens sent -> this means the constant product increases after the swap!

  const fromAmount = BigInt(sell.quantity)

  const poolFee = ceilDivision(
    BigInt(Number(pool.fee) * 1000) * fromAmount,
    BigInt(100 * 1000),
  )

  const getReceiveAmount = (poolA_: bigint, poolB_: bigint) => {
    const newPoolA = poolA_ + fromAmount - poolFee
    const newPoolB = ceilDivision(poolsProduct, newPoolA)

    return (poolB_ - newPoolB).toString()
  }

  // TODO: cast should be replaced by Quantity.asQuantity when exported
  const buy =
    sell.tokenId === pool.tokenA.tokenId
      ? {
          quantity: getReceiveAmount(poolA, poolB) as Balance.Quantity,
          tokenId: pool.tokenB.tokenId,
        }
      : {
          quantity: getReceiveAmount(poolB, poolA) as Balance.Quantity,
          tokenId: pool.tokenA.tokenId,
        }

  return {sell, buy}
}

export const getSellAmountByChangingReceive = (
  pool: Swap.Pool,
  buy: Balance.Amount,
): AmountPair => {
  const poolA = BigInt(pool.tokenA.quantity)
  const poolB = BigInt(pool.tokenB.quantity)
  const poolsProduct = poolA * poolB // fee is part of tokens sent -> this means the constant product increases after the swap!

  const toAmount = BigInt(buy.quantity)

  const poolFee = BigInt(100 * 1000) - BigInt(Number(pool.fee) * 1000)

  const getSendAmount = (poolA_: bigint, poolB_: bigint) => {
    const newPoolA =
      poolA_ - (poolA_ > toAmount ? toAmount : poolA_ - BigInt(1))
    const newPoolB = ceilDivision(poolsProduct + newPoolA, newPoolA)
    return ceilDivision(
      (newPoolB - poolB_) * BigInt(100 * 1000),
      poolFee,
    ).toString()
  }

  const sell =
    buy.tokenId === pool.tokenA.tokenId
      ? {
          quantity: getSendAmount(poolA, poolB) as Balance.Quantity,
          tokenId: pool.tokenB.tokenId,
        }
      : {
          quantity: getSendAmount(poolB, poolA) as Balance.Quantity,
          tokenId: pool.tokenA.tokenId,
        }

  return {buy, sell}
}

export const makeLimitOrder = (
  sell: Balance.Amount,
  buy: Balance.Amount,
  pool: Swap.Pool,
  slippage: number,
  address: string,
): Swap.CreateOrderData => {
  const receiveAmountWithSlippage = getQuantityWithSlippage(
    BigInt(buy.quantity),
    BigInt(slippage),
  )

  return {
    selectedPool: pool,
    address,
    slippage,
    amounts: {
      sell,
      buy: {
        tokenId: buy.tokenId,
        quantity: receiveAmountWithSlippage.toString() as Balance.Quantity,
      },
    },
  }
}

export const makePossibleMarketOrder = (
  sell: Balance.Amount,
  buy: Balance.Amount,
  pools: Swap.Pool[],
  slippage: number,
  address: string,
): Swap.CreateOrderData | undefined => {
  if (pools?.length === 0) {
    return undefined
  }

  const findBestOrder = (
    order: Swap.CreateOrderData | undefined,
    pool: Swap.Pool,
  ): Swap.CreateOrderData => {
    const amountPair = getReceiveAmountbyChangingSell(pool, sell)

    const receiveAmount = BigInt(amountPair.buy.quantity)
    const receiveAmountWithSlippage = getQuantityWithSlippage(
      receiveAmount,
      BigInt(slippage),
    )

    const newOrder: Swap.CreateOrderData = {
      selectedPool: pool,
      slippage,
      amounts: {
        sell: amountPair.sell,
        buy: {
          tokenId: buy.tokenId,
          quantity: receiveAmountWithSlippage.toString() as Balance.Quantity,
        },
      },
      address,
    }

    if (
      order === undefined ||
      BigInt(order.amounts.buy.quantity) < BigInt(newOrder.amounts.buy.quantity)
    ) {
      return newOrder
    }

    return order
  }

  return pools.reduce(findBestOrder, undefined)
}

export const getQuantityWithSlippage = (
  quantity: bigint,
  slippage: bigint,
): bigint => {
  const slippageAmount = ceilDivision(
    BigInt(1000) * slippage * quantity,
    BigInt(100 * 1000),
  )

  return quantity - slippageAmount
}

export const ceilDivision = (a: bigint, b: bigint) => {
  // div by zero || negative numbers are not supported
  if (a <= 0 || b - BigInt(1) <= 0) {
    return BigInt(0)
  }

  return (a + b - BigInt(1)) / b
}
