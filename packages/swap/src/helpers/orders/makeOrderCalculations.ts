import {Balance, Swap, Writable} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'
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
import {asQuantity} from '../../utils/asQuantity'

export const makeOrderCalculations = ({
  orderType,
  orderData,
  ptPrices,
  pools,
  primaryTokenId,
  action,
  lpTokenHeld,
}: Readonly<{
  orderType: Swap.OrderType
  orderData: Swap.CreateOrderData
  ptPrices: {
    buy: string
    sell: string
  }
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
    | SwapCreateOrderActionType.SwitchTokens
    | SwapCreateOrderActionType.LimitPriceChanged
}>) => {
  const result: Array<SwapOrderCalulation> = []

  const isLimit = orderType === 'limit'

  for (const pool of pools) {
    // when changing sell quantity, calculate buy quantity based on order type
    let buy: Balance.Amount | undefined
    if (action === SwapCreateOrderActionType.SellQuantityChanged) {
      buy = getBuyAmount(
        pool,
        orderData.amounts.sell,
        isLimit ? orderData.limitPrice : undefined,
      )
    }
    if (buy === undefined) buy = orderData.amounts.buy

    // when changing buy quantity, calculate sell quantity based on order type
    let sell: Balance.Amount | undefined
    if (action === SwapCreateOrderActionType.BuyQuantityChanged) {
      sell = getSellAmount(
        pool,
        orderData.amounts.buy,
        isLimit ? orderData.limitPrice : undefined,
      )
    }
    if (sell === undefined) sell = orderData.amounts.sell

    // when changing sell token ?
    // when changing buy token ?
    // when changing pool - limit order ?
    // when changing price - limit order ?

    // recalculate price base, limit is user's input, market from pool
    let priceBase: string
    const marketPrice = getMarketPrice(pool, orderData.amounts.sell)
    if (orderType === 'market') {
      priceBase = marketPrice
    } else {
      // NOTE: while editing should never receive undefined or '', undefined = market price, '' = NaN
      priceBase = orderData.limitPrice ?? marketPrice
    }

    // calculate buy quantity with slippage
    const buyAmountWithSlippage: Balance.Amount = {
      quantity: getQuantityWithSlippage(
        orderData.amounts.buy.quantity,
        orderData.slippage,
      ),
      tokenId: orderData.amounts.buy.tokenId,
    }

    // lf is sell side % of quantity ie. XToken 100 * 1% = 1 XToken
    const liquidityFee: Balance.Amount = getLiquidityProviderFee(
      pool.fee,
      orderData.amounts.sell,
    )

    // ffee is based on PT value range + LP holding range (sides may need conversion, when none is PT)
    const frontendFeeInfo = getFrontendFee({
      sell: orderData.amounts.sell,
      buy: orderData.amounts.buy,
      lpTokenHeld,
      primaryTokenId: primaryTokenId,
      sellInPrimaryTokenValue: {
        tokenId: primaryTokenId,
        quantity: asQuantity(
          new BigNumber(orderData.amounts.sell.quantity)
            .times(ptPrices.sell)
            .integerValue(BigNumber.ROUND_CEIL),
        ),
      },
      buyInPrimaryTokenValue: {
        tokenId: primaryTokenId,
        quantity: asQuantity(
          new BigNumber(orderData.amounts.buy.quantity)
            .times(ptPrices.buy)
            .integerValue(BigNumber.ROUND_CEIL),
        ),
      },
    })

    // transform fees in terms of sell side quantity * pt price (unit of fees)
    // it applies market price always
    const feeInSellSideQuantities = {
      batcherFee: new BigNumber(pool.batcherFee.quantity)
        .times(ptPrices.sell)
        .integerValue(BigNumber.ROUND_CEIL),
      frontendFee: new BigNumber(frontendFeeInfo.fee.quantity)
        .times(ptPrices.sell)
        .integerValue(BigNumber.ROUND_CEIL),
    }

    // add up all that's being sold in sell terms
    const sellWithFees = new BigNumber(sell.quantity)
      .plus(feeInSellSideQuantities.batcherFee)
      .plus(feeInSellSideQuantities.frontendFee)

    const priceWithFees = sellWithFees.dividedBy(buy.quantity)

    const priceWithSlippage = new BigNumber(sell.quantity)
      .dividedBy(buyAmountWithSlippage.quantity)
      .toString()

    const priceWithFeesAndSlippage = sellWithFees
      .dividedBy(buyAmountWithSlippage.quantity)
      .toString()

    // always based, if is limit it can lead to a weird percentage
    const priceDifference = priceWithFees
      .minus(priceBase)
      .dividedBy(priceBase)
      .times(100)
      .toString()

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
        withFees: priceWithFees.toString(),
        withSlippage: priceWithSlippage,
        withFeesAndSlippage: priceWithFeesAndSlippage,
        difference: priceDifference,
      },
      pool,
    }

    result.push(orderCalculation)

    // TODO: decide the "best" pool later, we need to define "best", maybe lowest price after fees?
  }

  return result
}
