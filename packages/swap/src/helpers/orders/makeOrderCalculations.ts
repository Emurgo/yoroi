import {Balance, Swap} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'
import {SwapOrderCalulation} from '../../translators/reactjs/state/state'
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
  limitPrice?: Balance.Quantity
  ptPrices: {
    buy?: Balance.Quantity
    sell?: Balance.Quantity
  }
  pools: ReadonlyArray<Swap.Pool>
  lpTokenHeld?: Balance.Amount
  slippage: number
  primaryTokenId: Balance.TokenInfo['id']
  action?: 'buy' | 'sell'
}>): Array<SwapOrderCalulation> => {
  const isLimit = orderType === 'limit'
  const maybeLimitPrice = isLimit ? limitPrice : undefined

  return pools.map<SwapOrderCalulation>((pool) => {
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

    // lf is sell side % of quantity ie. XToken 100 * 1% = 1 XToken
    const liquidityFee: Balance.Amount = getLiquidityProviderFee(pool.fee, sell)

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

    const poolSupply =
      buy.tokenId === pool.tokenA.tokenId
        ? pool.tokenA.quantity
        : pool.tokenB.quantity
    const hasSupply = !Quantities.isGreaterThan(
      buy.quantity,
      poolSupply ?? Quantities.zero,
    )

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
        withFees: asQuantity(priceWithFees),
        withSlippage: asQuantity(priceWithSlippage),
        withFeesAndSlippage: asQuantity(priceWithFeesAndSlippage),
        difference: asQuantity(priceDifference),
      },
      pool,
    }
  })
}
