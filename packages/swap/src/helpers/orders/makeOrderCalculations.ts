import {Balance, Swap, Writable} from '@yoroi/types'
import {
  SwapCreateOrderActionType,
  SwapOrderCalulation,
} from '../../translators/reactjs/state/state'
import {getQuantityWithSlippage} from './getQuantityWithSlippage'
import {Quantities} from '../../utils/quantities'
import {getLiquidityProviderFee} from './getLiquidityProviderFee'

export const makeOrderCalculations = ({
  orderData,
  pools,
  primaryTokenId,
  action,
}: Readonly<{
  orderData: Swap.CreateOrderData
  pools: Array<Swap.Pool>
  sellAmount: Balance.Amount
  buyAmount: Balance.Amount
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
    let orderCalculation: Writable<SwapOrderCalulation>

    orderCalculation = {
      cost: {
        batcherFee: pool.batcherFee,
        deposit: pool.deposit,
        frontendFeeInfo: {
          fee: {
            tokenId: primaryTokenId,
            quantity: Quantities.zero,
          },
          tier: undefined,
        },
        liquidityFee: getLiquidityProviderFee(pool.fee, orderData.amounts.sell),
      },
      buyAmountWithSlippage: {
        quantity: getQuantityWithSlippage(
          orderData.amounts.buy.quantity,
          orderData.slippage,
        ),
        tokenId: orderData.amounts.buy.tokenId,
      },
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
