import {Balance, Swap, Writable} from '@yoroi/types'
import {
  SwapCreateOrderActionType,
  SwapOrderCalulation,
} from '../../translators/reactjs/state/state'
import {getQuantityWithSlippage} from './getQuantityWithSlippage'
import {Quantities} from '../../utils/quantities'
import {getLiquidityProviderFee} from './getLiquidityProviderFee'
import {getFrontendFee} from './getFrontendFee'

export const makeOrderCalculations = ({
  orderData,
  pools,
  primaryTokenId,
  action,
  lpTokenHeld,
}: Readonly<{
  orderData: Swap.CreateOrderData
  pools: Array<Swap.Pool>
  sellAmount: Balance.Amount
  buyAmount: Balance.Amount
  lpTokenHeld: Balance.Amount
  slippage: number
  primaryTokenId: Balance.TokenInfo['id']
  action:
    | SwapCreateOrderActionType.SellQuantityChanged
    | SwapCreateOrderActionType.SellTokenIdChanged
    | SwapCreateOrderActionType.BuyQuantityChanged
    | SwapCreateOrderActionType.BuyTokenIdChanged
    | SwapCreateOrderActionType.SlippageChanged
    | SwapCreateOrderActionType.PoolPairsChanged
}>) => {
  console.log(action)
  const result: Array<SwapOrderCalulation> = []

  pools.forEach((pool) => {
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
      sell: {
        price: '',
        priceDifference: '',
        priceWithFees: '',
        priceWithFeesAndSlippage: '',
        priceWithSlippage: '',
      },
      pool,
    }

    result.push(orderCalculation)

    // TODO: decide the "best" pool later, we need to define "best", maybe lowest price after fees?
  })

  return result
}
