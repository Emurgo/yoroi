import {Balance, Swap, Writable} from '@yoroi/types'
import {
  SwapCreateOrderActionType,
  SwapOrderCalulation,
} from '../../translators/reactjs/state/state'
import {getQuantityWithSlippage} from './getQuantityWithSlippage'
import {Quantities} from '../../utils/quantities'
import {getLiquidityProviderFee} from './getLiquidityProviderFee'
import {getFrontendFee} from './getFrontendFee'
import {getMarketPrice} from './getMarketPrice'
import {getBuyAmount} from './getBuyAmount'
import {getSellAmount} from './getSellAmount'

export const makeOrderCalculations = ({
  orderType,
  orderData,
  pools,
  primaryTokenId,
  action,
  lpTokenHeld,
}: Readonly<{
  orderType: Swap.OrderType
  orderData: Swap.CreateOrderData
  pools: Array<Swap.Pool>
  sellAmount: Balance.Amount
  buyAmount: Balance.Amount
  lpTokenHeld: Balance.Amount
  slippage: number
  primaryTokenId: Balance.TokenInfo['id']
  // TODO: guessing that later it will boils down to 2/3 scenarios
  action:
    | SwapCreateOrderActionType.SellQuantityChanged
    | SwapCreateOrderActionType.SellTokenIdChanged
    | SwapCreateOrderActionType.BuyQuantityChanged
    | SwapCreateOrderActionType.BuyTokenIdChanged
    | SwapCreateOrderActionType.SlippageChanged
    | SwapCreateOrderActionType.PoolPairsChanged
    | SwapCreateOrderActionType.OrderTypeChanged
}>) => {
  const result: Array<SwapOrderCalulation> = []

  const isSellZero = Quantities.isZero(orderData.amounts.sell.quantity)
  const isBuyZero = Quantities.isZero(orderData.amounts.buy.quantity)
  const isLimit = orderType === 'limit'

  for (const pool of pools) {
    let buy: Balance.Amount | undefined
    if (action === SwapCreateOrderActionType.SellQuantityChanged) {
      if (isSellZero) {
        buy = {
          tokenId: orderData.amounts.buy.tokenId,
          quantity: Quantities.zero,
        }
      } else {
        buy = getBuyAmount(
          pool,
          orderData.amounts.sell,
          isLimit ? orderData.limitPrice : undefined,
        )
      }
    }
    if (buy === undefined) buy = orderData.amounts.buy

    let sell: Balance.Amount | undefined
    if (action === SwapCreateOrderActionType.BuyQuantityChanged) {
      if (isBuyZero) {
        sell = {
          tokenId: orderData.amounts.sell.tokenId,
          quantity: Quantities.zero,
        }
      } else {
        sell = getSellAmount(
          pool,
          orderData.amounts.buy,
          isLimit ? orderData.limitPrice : undefined,
        )
      }
    }
    if (sell === undefined) sell = orderData.amounts.sell

    console.log(buy, sell, isBuyZero, isSellZero)

    // TODO: if any side is zero set as 0
    let priceBase: string = ''
    const marketPrice = getMarketPrice(pool, orderData.amounts.sell)
    if (orderType === 'market') {
      priceBase = marketPrice
    } else {
      // NOTE: while editing should never receive undefined, otherwise it will replace with market price
      priceBase = orderData.limitPrice ?? marketPrice
    }

    const buyAmountWithSlippage: Balance.Amount = {
      quantity: getQuantityWithSlippage(
        orderData.amounts.buy.quantity,
        orderData.slippage,
      ),
      tokenId: orderData.amounts.buy.tokenId,
    }

    const liquidityFee: Balance.Amount = getLiquidityProviderFee(
      pool.fee,
      orderData.amounts.sell,
    )

    const frontendFeeInfo = getFrontendFee({
      sell: orderData.amounts.sell,
      buy: orderData.amounts.buy,
      lpTokenHeld,
      primaryTokenId: primaryTokenId,
      // TODO: implement after adding the pair to ADA in the state
      // sellInPrimaryTokenValue: orderData.sellInPrimaryTokenValue,
      // buyInPrimaryTokenValue: orderData.buyInPrimaryTokenValue,
    })

    const orderCalculation: SwapOrderCalulation = {
      cost: {
        batcherFee: pool.batcherFee,
        deposit: pool.deposit,
        frontendFeeInfo,
        liquidityFee,
      },
      buyAmountWithSlippage,
      prices: {
        base: priceBase,
        market: marketPrice,
        withFees: '',
        difference: '',
        withSlippage: '',
        withFeesAndSlippage: '',
      },
      pool,
    }

    result.push(orderCalculation)

    // TODO: decide the "best" pool later, we need to define "best", maybe lowest price after fees?
  }

  return result
}
