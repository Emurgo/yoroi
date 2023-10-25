import {App, Balance, Swap} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'
import {
  SwapOrderCalculation,
  SwapState,
} from '../../../translators/reactjs/state/state'
import {getQuantityWithSlippage} from '../amounts/getQuantityWithSlippage'
import {getLiquidityProviderFee} from '../costs/getLiquidityProviderFee'
import {getFrontendFee} from '../costs/getFrontendFee'
import {getMarketPrice} from '../../prices/getMarketPrice'
import {getBuyAmount} from '../amounts/getBuyAmount'
import {getSellAmount} from '../amounts/getSellAmount'
import {asQuantity} from '../../../utils/asQuantity'
import {Quantities} from '../../../utils/quantities'

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
}: Readonly<{
  orderType: Swap.OrderType
  amounts: {
    sell: Balance.Amount
    buy: Balance.Amount
  }
  limitPrice?: Balance.Quantity
  pools: ReadonlyArray<Swap.Pool>
  lpTokenHeld?: Balance.Amount
  slippage: number
  side?: 'buy' | 'sell'
  frontendFeeTiers: ReadonlyArray<App.FrontendFeeTier>
  tokens: SwapState['orderData']['tokens']
}>): Array<SwapOrderCalculation> => {
  const isLimit = orderType === 'limit'
  const maybeLimitPrice = isLimit ? limitPrice : undefined

  const calculations = pools.map<SwapOrderCalculation>((pool) => {
    const buy =
      side === 'sell'
        ? getBuyAmount(pool, amounts.sell, maybeLimitPrice)
        : amounts.buy
    const sell =
      side === 'buy'
        ? getSellAmount(pool, amounts.buy, maybeLimitPrice)
        : amounts.sell

    const marketPrice = getMarketPrice(pool, sell)
    // recalculate price base, limit is user's input, market from pool
    const priceBase = maybeLimitPrice ?? marketPrice

    // calculate buy quantity with slippage
    const buyAmountWithSlippage: Balance.Amount = {
      quantity: getQuantityWithSlippage(buy.quantity, slippage),
      tokenId: buy.tokenId,
    }

    const isBuyTokenA = buy.tokenId === pool.tokenA.tokenId

    // pools that with not enough supply will be filtered out
    const poolSupply = isBuyTokenA ? pool.tokenA.quantity : pool.tokenB.quantity
    const supplyRequired =
      (!Quantities.isZero(buy.quantity) || !Quantities.isZero(sell.quantity)) &&
      Quantities.isZero(poolSupply)
    const hasSupply =
      !Quantities.isGreaterThan(buy.quantity, poolSupply) && !supplyRequired

    // lf is sell side % of quantity ie. XToken 100 * 1% = 1 XToken
    const liquidityFee: Balance.Amount = getLiquidityProviderFee(pool.fee, sell)

    // whether sell or buy is PT, then we use the quantity as frontend fee base
    // otherwise we derive from the ptPrice of the pool of the sell side
    const ptPriceSell = isBuyTokenA
      ? new BigNumber(pool.ptPriceTokenB)
      : new BigNumber(pool.ptPriceTokenA)
    const sellQuantity = new BigNumber(sell.quantity)
    const sellInPtTerms = asQuantity(sellQuantity.multipliedBy(ptPriceSell))

    // ffee is based on PT value range + LP holding range
    const frontendFeeInfo = getFrontendFee({
      lpTokenHeld,
      ptAmount: {
        tokenId: tokens.ptInfo.id,
        quantity: sellInPtTerms,
      },
      feeTiers: frontendFeeTiers,
    })

    // transform fees in terms of sell side quantity * pt price (unit of fees)
    // it applies market price always
    const feeInSellSideQuantities = {
      batcherFee: ptPriceSell.isZero()
        ? Quantities.zero
        : new BigNumber(pool.batcherFee.quantity)
            .dividedBy(ptPriceSell)
            .integerValue(BigNumber.ROUND_CEIL)
            .toString(),
      frontendFee: ptPriceSell.isZero()
        ? Quantities.zero
        : new BigNumber(frontendFeeInfo.fee.quantity)
            .dividedBy(ptPriceSell)
            .integerValue(BigNumber.ROUND_CEIL)
            .toString(),
    }

    const priceWithSlippage = Quantities.isZero(buyAmountWithSlippage.quantity)
      ? Quantities.zero
      : asQuantity(
          new BigNumber(sell.quantity)
            .dividedBy(buyAmountWithSlippage.quantity)
            .toString(),
        )

    // add up all that's being sold in sell terms
    const sellWithFees = new BigNumber(sell.quantity)
      .plus(feeInSellSideQuantities.batcherFee)
      .plus(feeInSellSideQuantities.frontendFee)

    const priceWithFees = Quantities.isZero(buy.quantity)
      ? new BigNumber(0)
      : sellWithFees.dividedBy(buy.quantity)

    const priceWithFeesAndSlippage = Quantities.isZero(
      buyAmountWithSlippage.quantity,
    )
      ? Quantities.zero
      : sellWithFees.dividedBy(buyAmountWithSlippage.quantity).toString()

    // always based, if is limit it can lead to a weird percentage
    const priceDifference = Quantities.isZero(priceBase)
      ? Quantities.zero
      : priceWithFees
          .minus(priceBase)
          .dividedBy(priceBase)
          .times(100)
          .toString()

    // fees + ffee + slippage
    const withFees = asQuantity(priceWithFees)
    const withFeesAndSlippage = asQuantity(priceWithFeesAndSlippage)
    const difference = asQuantity(priceDifference)

    const ptTotalRequired: Balance.Amount = {
      tokenId: tokens.ptInfo.id,
      quantity: Quantities.sum([
        pool.batcherFee.quantity,
        pool.deposit.quantity,
        frontendFeeInfo.fee.quantity,
      ]),
    }

    const result: SwapOrderCalculation = {
      order: {
        side,
        slippage,
        orderType,
        limitPrice,
        amounts,
        lpTokenHeld,
      },
      sides: {
        buy,
        sell,
      },
      cost: {
        batcherFee: pool.batcherFee,
        deposit: pool.deposit,
        frontendFeeInfo,
        liquidityFee,
        ptTotalRequired,
      },
      buyAmountWithSlippage,
      hasSupply,
      prices: {
        base: priceBase,
        market: marketPrice,
        withSlippage: priceWithSlippage,
        withFees,
        withFeesAndSlippage,
        difference,
      },
      pool,
    } as const

    return result
  })

  return calculations
}
