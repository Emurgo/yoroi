import {App, Portfolio, Swap} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'
import {SwapState} from '../../../translators/reactjs/state/state'
import {getQuantityWithSlippage} from '../amounts/getQuantityWithSlippage'
import {getLiquidityProviderFee} from '../costs/getLiquidityProviderFee'
import {getFrontendFee} from '../costs/getFrontendFee'
import {getMarketPrice} from '../../prices/getMarketPrice'
import {getBuyAmount} from '../amounts/getBuyAmount'
import {getSellAmount} from '../amounts/getSellAmount'
import {SwapOrderCalculation} from '../../../types'

export const makeOrderCalculations = ({
  orderType,
  amounts,
  limitPrice,
  slippage,
  pools,
  lpTokenHeld,
  side,
  frontendFeeTiers,
  tokens,
  priceDecimals = 10,
}: Readonly<{
  orderType: Swap.OrderType
  amounts: {
    sell?: Portfolio.Token.Amount
    buy?: Portfolio.Token.Amount
  }
  limitPrice?: string
  pools: ReadonlyArray<Swap.Pool>
  lpTokenHeld?: Portfolio.Token.Amount
  slippage: number
  side?: 'buy' | 'sell'
  frontendFeeTiers: ReadonlyArray<App.FrontendFeeTier>
  tokens: SwapState['orderData']['tokens']
  priceDecimals?: number
}>): Array<SwapOrderCalculation> => {
  if (!amounts.sell || !amounts.buy || !tokens.ptInfo) return []

  const isLimit = orderType === 'limit'
  const maybeLimitPrice = isLimit ? new BigNumber(limitPrice ?? 0) : undefined

  const calculations = pools.map<SwapOrderCalculation>((pool) => {
    const buy =
      side === 'sell'
        ? getBuyAmount(
            pool,
            amounts.sell!,
            amounts.buy!.info,
            isLimit,
            maybeLimitPrice,
          )
        : amounts.buy!
    const sell =
      side === 'buy'
        ? getSellAmount(
            pool,
            amounts.buy!,
            amounts.sell!.info,
            isLimit,
            maybeLimitPrice,
          )
        : amounts.sell!

    const marketPrice = getMarketPrice(pool, sell.info.id)
    // recalculate price base, limit is user's input, market from pool
    const priceBase = maybeLimitPrice ?? marketPrice

    // calculate buy quantity with slippage
    const buyAmountWithSlippage: Portfolio.Token.Amount = {
      quantity: getQuantityWithSlippage(buy.quantity, slippage),
      info: buy.info,
    }

    const isBuyTokenA = buy.info.id === pool.tokenA.tokenId

    // pools without enough supply will be filtered out
    const poolSupply = isBuyTokenA ? pool.tokenA.quantity : pool.tokenB.quantity
    const supplyRequired =
      (buy.quantity > 0n || sell.quantity > 0n) && poolSupply === 0n
    const hasSupply = buy.quantity <= poolSupply && !supplyRequired

    const sellQuantity = new BigNumber(sell.quantity.toString())
    const buyQuantity = new BigNumber(buy.quantity.toString())
    const marketPriceQuantity = new BigNumber(marketPrice)

    const actualPriceQuantity = buyQuantity.isZero()
      ? new BigNumber(0)
      : sellQuantity.dividedBy(buyQuantity)

    const priceImpact = marketPrice.isZero()
      ? marketPrice
      : actualPriceQuantity
          .minus(marketPriceQuantity)
          .dividedBy(marketPriceQuantity)
          .times(100)

    // lf is sell side % of quantity ie. XToken 100 * 1% = 1 XToken
    const liquidityFee: Portfolio.Token.Amount = getLiquidityProviderFee(
      pool.fee,
      sell,
    )

    // whether sell or buy is PT, then we use the quantity as frontend fee base
    // otherwise we derive from the ptPrice of the pool of the sell side
    const ptPriceSell = isBuyTokenA
      ? new BigNumber(pool.ptPriceTokenB)
      : new BigNumber(pool.ptPriceTokenA)

    const sellInPtTerms = BigInt(
      sellQuantity
        .multipliedBy(ptPriceSell)
        .integerValue(BigNumber.ROUND_DOWN)
        .toFixed(0),
    )

    // ffee is based on PT value range + LP holding range
    const frontendFeeInfo = getFrontendFee({
      lpTokenHeld,
      ptAmount: {
        info: tokens.ptInfo!,
        quantity: sellInPtTerms,
      },
      feeTiers: frontendFeeTiers,
    })

    // transform fees in terms of sell side quantity * pt price (unit of fees)
    // it applies market price always
    const feeInSellSideQuantities = {
      batcherFee: ptPriceSell.isZero()
        ? new BigNumber(0)
        : new BigNumber(pool.batcherFee.quantity.toString())
            .dividedBy(ptPriceSell)
            .integerValue(BigNumber.ROUND_CEIL),
      frontendFee: ptPriceSell.isZero()
        ? new BigNumber(0)
        : new BigNumber(frontendFeeInfo.fee.quantity.toString())
            .dividedBy(ptPriceSell)
            .integerValue(BigNumber.ROUND_CEIL),
    }

    const priceWithSlippage =
      buyAmountWithSlippage.quantity === 0n
        ? new BigNumber(0)
        : sellQuantity.dividedBy(buyAmountWithSlippage.quantity.toString())

    // add up all that's being sold in sell terms
    const sellWithFees = sellQuantity
      .plus(feeInSellSideQuantities.batcherFee)
      .plus(feeInSellSideQuantities.frontendFee)

    const priceWithFees = buyQuantity.isZero()
      ? new BigNumber(0)
      : sellWithFees.dividedBy(buyQuantity)

    const priceWithFeesAndSlippage =
      buyAmountWithSlippage.quantity === 0n
        ? new BigNumber(0)
        : sellWithFees.dividedBy(buyAmountWithSlippage.quantity.toString())

    // always based, if is limit it can lead to a weird percentage
    const priceDifference = priceBase.isZero()
      ? new BigNumber(0)
      : priceWithFees.minus(priceBase).dividedBy(priceBase).times(100)

    // fees + ffee + slippage
    const withFees = new BigNumber(priceWithFees)
    const withFeesAndSlippage = new BigNumber(priceWithFeesAndSlippage)
    const difference = new BigNumber(priceDifference)

    const ptTotalRequired: Portfolio.Token.Amount = {
      info: tokens.ptInfo!,
      quantity:
        pool.batcherFee.quantity +
        pool.deposit.quantity +
        frontendFeeInfo.fee.quantity,
    }

    const ptTotalValueSpent: Portfolio.Token.Amount | undefined =
      sellInPtTerms === 0n
        ? undefined
        : {
            info: tokens.ptInfo!,
            quantity:
              pool.batcherFee.quantity +
              frontendFeeInfo.fee.quantity +
              sellInPtTerms,
          }

    const batcherFee: Portfolio.Token.Amount = {
      quantity: pool.batcherFee.quantity,
      info: tokens.ptInfo!,
    }

    const deposit: Portfolio.Token.Amount = {
      quantity: pool.deposit.quantity,
      info: tokens.ptInfo!,
    }

    const result: SwapOrderCalculation = {
      order: {
        side,
        slippage,
        orderType,
        limitPrice,
        amounts: {
          sell: amounts.sell!,
          buy: amounts.buy!,
        },
        lpTokenHeld,
      },
      sides: {
        buy,
        sell,
      },
      cost: {
        batcherFee,
        deposit,
        frontendFeeInfo,
        liquidityFee,
        ptTotalRequired,
      },
      buyAmountWithSlippage,
      hasSupply,
      ptTotalValueSpent,
      prices: {
        base: priceBase.toFixed(priceDecimals, BigNumber.ROUND_DOWN),
        market: marketPrice.toFixed(priceDecimals, BigNumber.ROUND_DOWN),
        actualPrice: actualPriceQuantity.toFixed(
          priceDecimals,
          BigNumber.ROUND_DOWN,
        ),
        withSlippage: priceWithSlippage.toFixed(
          priceDecimals,
          BigNumber.ROUND_DOWN,
        ),
        withFees: withFees.toFixed(priceDecimals, BigNumber.ROUND_DOWN),
        withFeesAndSlippage: withFeesAndSlippage.toFixed(
          priceDecimals,
          BigNumber.ROUND_DOWN,
        ),
        difference: difference.toFixed(priceDecimals, BigNumber.ROUND_DOWN),
        priceImpact: priceImpact.toFixed(priceDecimals, BigNumber.ROUND_DOWN),
      },
      pool,
    } as const

    return result
  })

  return calculations
}
