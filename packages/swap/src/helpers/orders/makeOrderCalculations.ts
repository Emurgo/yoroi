import {Balance, Swap} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'
import {
  SwapCreateOrderActionType,
  SwapOrderCalulation,
} from '../../translators/reactjs/state/state'
import {getQuantityWithSlippage} from './getQuantityWithSlippage'
import {getLiquidityProviderFee} from './getLiquidityProviderFee'
import {getFrontendFee} from './getFrontendFee'
import {getMarketPrice} from './getMarketPrice'
import {getBuyAmount} from './getBuyAmount'
import {getSellAmount} from './getSellAmount'
import {asQuantity} from '../../utils/asQuantity'

export const makeOrderCalculations = ({
  orderType,
  amounts,
  limitPrice,
  slippage,
  ptPrices,
  pools,
  primaryTokenId,
  lpTokenHeld,
  action,
}: Readonly<{
  orderType: Swap.OrderType
  amounts: {
    sell: Balance.Amount
    buy: Balance.Amount
  }
  limitPrice: `${number}` | undefined
  ptPrices: {
    buy: `${number}` | undefined
    sell: `${number}` | undefined
  }
  pools: ReadonlyArray<Swap.Pool>
  lpTokenHeld: Balance.Amount | undefined
  slippage: number
  primaryTokenId: Balance.TokenInfo['id']
  // TODO: guessing that later it will boils down to 2/3 scenarios
  action:
    | SwapCreateOrderActionType.SellQuantityChanged
    | SwapCreateOrderActionType.BuyQuantityChanged
    // same bag for now
    | SwapCreateOrderActionType.SellTokenIdChanged
    | SwapCreateOrderActionType.BuyTokenIdChanged
    | SwapCreateOrderActionType.SlippageChanged
    | SwapCreateOrderActionType.PoolPairsChanged
    | SwapCreateOrderActionType.OrderTypeChanged
    | SwapCreateOrderActionType.SwitchTokens
    | SwapCreateOrderActionType.LimitPriceChanged
    | SwapCreateOrderActionType.ResetQuantities
    | SwapCreateOrderActionType.LpTokenHeldChanged
}>) => {
  const result: Array<SwapOrderCalulation> = []
  const isLimit = orderType === 'limit'

  // when changing sell token ?
  // when changing buy token ?
  // when changing pool - limit order ?
  // when changing price - limit order ?
  // when switching sell/buy
  // when changing slippage
  // when changing the lp token held
  // when reseting quantities

  pools.forEach((pool) => {
    // when changing sell quantity, calculate buy quantity based on order type
    let buy: Balance.Amount | undefined
    if (action === SwapCreateOrderActionType.SellQuantityChanged) {
      buy = getBuyAmount(pool, amounts.sell, isLimit ? limitPrice : undefined)
    }
    if (buy === undefined) buy = amounts.buy

    // when changing buy quantity, calculate sell quantity based on order type
    let sell: Balance.Amount | undefined
    if (action === SwapCreateOrderActionType.BuyQuantityChanged) {
      sell = getSellAmount(pool, amounts.buy, isLimit ? limitPrice : undefined)
    }
    if (sell === undefined) sell = amounts.sell

    // recalculate price base, limit is user's input, market from pool
    let priceBase: string
    const marketPrice = getMarketPrice(pool, amounts.sell)
    if (orderType === 'market') {
      priceBase = marketPrice
    } else {
      // NOTE: while editing should never receive undefined or '', undefined = market price, '' = NaN
      // when switching sell/buy limit is kept
      priceBase = limitPrice ?? marketPrice
    }

    // calculate buy quantity with slippage
    const buyAmountWithSlippage: Balance.Amount = {
      quantity: getQuantityWithSlippage(amounts.buy.quantity, slippage),
      tokenId: amounts.buy.tokenId,
    }

    // lf is sell side % of quantity ie. XToken 100 * 1% = 1 XToken
    const liquidityFee: Balance.Amount = getLiquidityProviderFee(
      pool.fee,
      amounts.sell,
    )

    // ffee is based on PT value range + LP holding range (sides may need conversion, when none is PT)
    const frontendFeeInfo = getFrontendFee({
      sell: amounts.sell,
      buy: amounts.buy,
      lpTokenHeld,
      primaryTokenId: primaryTokenId,
      sellInPrimaryTokenValue: {
        tokenId: primaryTokenId,
        quantity: asQuantity(
          new BigNumber(amounts.sell.quantity)
            .times(ptPrices.sell ?? 0)
            .integerValue(BigNumber.ROUND_CEIL),
        ),
      },
      buyInPrimaryTokenValue: {
        tokenId: primaryTokenId,
        quantity: asQuantity(
          new BigNumber(amounts.buy.quantity)
            .times(ptPrices.buy ?? 0)
            .integerValue(BigNumber.ROUND_CEIL),
        ),
      },
    })

    // transform fees in terms of sell side quantity * pt price (unit of fees)
    // it applies market price always
    const feeInSellSideQuantities = {
      batcherFee: new BigNumber(pool.batcherFee.quantity)
        .times(ptPrices.sell ?? 0)
        .integerValue(BigNumber.ROUND_CEIL),
      frontendFee: new BigNumber(frontendFeeInfo.fee.quantity)
        .times(ptPrices.sell ?? 0)
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
  })

  return result
}
