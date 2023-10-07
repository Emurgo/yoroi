import {Balance, Swap} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'
import {SwapOrderCalculation} from '../../translators/reactjs/state/state'
import {getQuantityWithSlippage} from './getQuantityWithSlippage'
import {getLiquidityProviderFee} from './getLiquidityProviderFee'
import {getFrontendFee} from './getFrontendFee'
import {getMarketPrice} from './getMarketPrice'
import {getBuyAmount} from './getBuyAmount'
import {getSellAmount} from './getSellAmount'
import {asQuantity} from '../../utils/asQuantity'
import {Quantities} from '../../utils/quantities'

export const makeOrderCalculations = ({
  orderType,
  amounts,
  limitPrice,
  slippage,
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
  limitPrice?: Balance.Quantity
  pools: ReadonlyArray<Swap.Pool>
  lpTokenHeld?: Balance.Amount
  slippage: number
  primaryTokenId: Balance.TokenInfo['id']
  action?: 'buy' | 'sell'
}>): Array<SwapOrderCalculation> => {
  const isLimit = orderType === 'limit'
  const maybeLimitPrice = isLimit ? limitPrice : undefined

  return pools.map<SwapOrderCalculation>((pool) => {
    const buy =
      action === 'sell'
        ? getBuyAmount(pool, amounts.sell, maybeLimitPrice)
        : amounts.buy
    const sell =
      action === 'buy'
        ? getSellAmount(pool, amounts.buy, maybeLimitPrice)
        : amounts.sell

    const marketPrice = getMarketPrice(pool, sell)
    // recalculate price base, limit is user's input, market from pool
    const priceBase = isLimit ? limitPrice ?? marketPrice : marketPrice

    // calculate buy quantity with slippage
    const buyAmountWithSlippage: Balance.Amount = {
      quantity: getQuantityWithSlippage(buy.quantity, slippage),
      tokenId: buy.tokenId,
    }

    // pools that with not enough supply will be filtered out
    const isBuyTokenA = buy.tokenId === pool.tokenA.tokenId
    const poolSupply = isBuyTokenA ? pool.tokenA.quantity : pool.tokenB.quantity
    const hasSupply = !Quantities.isGreaterThan(
      buy.quantity,
      poolSupply ?? Quantities.zero,
    )

    // lf is sell side % of quantity ie. XToken 100 * 1% = 1 XToken
    const liquidityFee: Balance.Amount = getLiquidityProviderFee(pool.fee, sell)

    const [ptPriceBuy, ptPriceSell] = isBuyTokenA
      ? [pool.ptPriceTokenA, pool.ptPriceTokenB]
      : [pool.ptPriceTokenB, pool.ptPriceTokenA]

    // ffee is based on PT value range + LP holding range (sides may need conversion, when none is PT)
    const frontendFeeInfo = getFrontendFee({
      sell,
      buy,
      lpTokenHeld,
      primaryTokenId,
      sellInPrimaryTokenValue: {
        tokenId: primaryTokenId,
        quantity: asQuantity(
          new BigNumber(amounts.sell.quantity)
            .times(ptPriceSell)
            .integerValue(BigNumber.ROUND_CEIL),
        ),
      },
      buyInPrimaryTokenValue: {
        tokenId: primaryTokenId,
        quantity: asQuantity(
          new BigNumber(amounts.buy.quantity)
            .times(ptPriceBuy)
            .integerValue(BigNumber.ROUND_CEIL),
        ),
      },
    })

    // transform fees in terms of sell side quantity * pt price (unit of fees)
    // it applies market price always
    const feeInSellSideQuantities = {
      batcherFee: new BigNumber(pool.batcherFee.quantity)
        .times(ptPriceSell)
        .integerValue(BigNumber.ROUND_CEIL),
      frontendFee: new BigNumber(frontendFeeInfo.fee.quantity)
        .times(ptPriceSell)
        .integerValue(BigNumber.ROUND_CEIL),
    }

    const priceWithSlippage = Quantities.isZero(buyAmountWithSlippage.quantity)
      ? Quantities.zero
      : asQuantity(
          new BigNumber(sell.quantity)
            .dividedBy(buyAmountWithSlippage.quantity)
            .toString(),
        )

    const calculatePricesWithFees = (withFrontendFee?: boolean) => {
      // add up all that's being sold in sell terms
      const sellWithBatcher = new BigNumber(sell.quantity).plus(
        feeInSellSideQuantities.batcherFee,
      )
      const sellWithFees = withFrontendFee
        ? sellWithBatcher.plus(feeInSellSideQuantities.frontendFee)
        : sellWithBatcher

      const priceWithFees = Quantities.isZero(buy.quantity)
        ? new BigNumber(0)
        : sellWithFees.dividedBy(buy.quantity)

      const priceWithFeesAndSlippage = Quantities.isZero(
        buyAmountWithSlippage.quantity,
      )
        ? Quantities.zero
        : sellWithFees.dividedBy(buyAmountWithSlippage.quantity).toString()

      // always based, if is limit it can lead to a weird percentage
      const priceDifference = priceWithFees
        .minus(priceBase)
        .dividedBy(priceBase)
        .times(100)
        .toString()

      return {
        priceWithFees: asQuantity(priceWithFees),
        priceWithFeesAndSlippage: asQuantity(priceWithFeesAndSlippage),
        priceDifference: asQuantity(priceDifference),
      }
    }

    const {
      priceWithFees: withFees,
      priceWithFeesAndSlippage: withFeesAndSlippage,
      priceDifference: difference,
    } = calculatePricesWithFees(true)
    const {
      priceWithFees: withFeesNoFEF,
      priceWithFeesAndSlippage: withFeesAndSlippageNoFEF,
      priceDifference: differenceNoFEF,
    } = calculatePricesWithFees(false)
    return {
      cost: {
        batcherFee: pool.batcherFee,
        deposit: pool.deposit,
        frontendFeeInfo,
        liquidityFee,
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
        withFeesNoFEF,
        withFeesAndSlippageNoFEF,
        differenceNoFEF,
      },
      pool,
    }
  })
}
