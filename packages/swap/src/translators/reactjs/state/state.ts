import {Balance, Swap} from '@yoroi/types'
import {produce} from 'immer'

import {getBuyAmount} from '../../../helpers/orders/getBuyAmount'
import {getSellAmount} from '../../../helpers/orders/getSellAmount'
import {getMarketPrice} from '../../../helpers/orders/getMarketPrice'
import {Quantities} from '../../../utils/quantities'

export type SwapState = Readonly<{
  createOrder: Swap.CreateOrderData & {
    type: Swap.OrderType
    marketPrice: Balance.Quantity
    datum: string
    datumHash: string
  }
  unsignedTx: any
}>

export type SwapCreateOrderActions = Readonly<{
  orderTypeChanged: (orderType: Swap.OrderType) => void
  sellAmountChanged: (sellAmount: Readonly<Balance.Amount>) => void
  buyAmountChanged: (buyAmount: Readonly<Balance.Amount>) => void
  selectedPoolChanged: (pool: Readonly<Swap.Pool>) => void
  slippageChanged: (slippage: number) => void
  txPayloadChanged: (txPayload: Readonly<Swap.CreateOrderResponse>) => void
  switchTokens: () => void
  resetQuantities: () => void
  limitPriceChanged: (limitPrice: Balance.Quantity) => void
}>

export enum SwapCreateOrderActionType {
  OrderTypeChanged = 'orderTypeChanged',
  SellAmountChanged = 'sellAmountChanged',
  BuyAmountChanged = 'buyAmountChanged',
  ProtocolChanged = 'protocolChanged',
  SelectedPoolChanged = 'selectedPoolChanged',
  SlippageChanged = 'slippageChanged',
  TxPayloadChanged = 'txPayloadChanged',
  SwitchTokens = 'switchTokens',
  ResetQuantities = 'resetQuantities',
  LimitPriceChanged = 'limitPriceChanged',
}

export type SwapCreateOrderAction =
  | {
      type: SwapCreateOrderActionType.OrderTypeChanged
      orderType: Swap.OrderType
    }
  | {
      type: SwapCreateOrderActionType.SellAmountChanged
      amount: Readonly<Balance.Amount>
    }
  | {
      type: SwapCreateOrderActionType.BuyAmountChanged
      amount: Readonly<Balance.Amount>
    }
  | {
      type: SwapCreateOrderActionType.ProtocolChanged
      protocol: Swap.Protocol
    }
  | {
      type: SwapCreateOrderActionType.SelectedPoolChanged
      pool: Readonly<Swap.Pool>
    }
  | {
      type: SwapCreateOrderActionType.SlippageChanged; // prettier-ignore
      slippage: number
    }
  | {
      type: SwapCreateOrderActionType.TxPayloadChanged
      txPayload: Readonly<Swap.CreateOrderResponse>
    }
  | {
      type: SwapCreateOrderActionType.LimitPriceChanged
      limitPrice: Balance.Quantity
    }
  | {type: SwapCreateOrderActionType.SwitchTokens}
  | {type: SwapCreateOrderActionType.ResetQuantities}

export type SwapActions = Readonly<{
  // TODO: import from @yoroi/common unsignedTx type
  unsignedTxChanged: (
    unsignedTx: Readonly<Record<string, unknown>> | undefined,
  ) => void
  resetState: () => void
}>

export enum SwapActionType {
  UnsignedTxChanged = 'unsignedTxChanged',
  ResetState = 'resetState',
}

export type SwapAction =
  | {
      type: SwapActionType.UnsignedTxChanged
      unsignedTx: Readonly<Record<string, unknown>> | undefined
    }
  | {type: SwapActionType.ResetState}

export const combinedSwapReducers = (
  state: SwapState,
  action: SwapCreateOrderAction | SwapAction,
) => {
  return {
    ...swapReducer(
      {
        ...state,
        ...createOrderReducer(state, action as SwapCreateOrderAction),
      },
      action as SwapAction,
    ),
  } as const
}

export const defaultSwapState: SwapState = {
  createOrder: {
    type: 'market',
    address: '',
    datum: '',
    datumHash: '',
    amounts: {
      sell: {
        quantity: Quantities.zero,
        tokenId: '',
      },
      buy: {
        quantity: Quantities.zero,
        tokenId: '',
      },
    },
    slippage: 1,
    limitPrice: Quantities.zero,
    marketPrice: Quantities.zero,
    selectedPool: {
      provider: 'minswap',
      fee: '',
      tokenA: {tokenId: '', quantity: Quantities.zero},
      tokenB: {tokenId: '', quantity: Quantities.zero},
      price: 0,
      batcherFee: {tokenId: '', quantity: Quantities.zero},
      deposit: {tokenId: '', quantity: Quantities.zero},
      poolId: '',
      lastUpdate: '',
      lpToken: {tokenId: '', quantity: Quantities.zero},
    },
  },
  unsignedTx: undefined,
} as const

const defaultSwapCreateOrderActions: SwapCreateOrderActions = {
  orderTypeChanged: missingInit,
  sellAmountChanged: missingInit,
  buyAmountChanged: missingInit,
  selectedPoolChanged: missingInit,
  slippageChanged: missingInit,
  txPayloadChanged: missingInit,
  switchTokens: missingInit,
  resetQuantities: missingInit,
  limitPriceChanged: missingInit,
} as const

const defaultStateActions: SwapActions = {
  unsignedTxChanged: missingInit,
  resetState: missingInit,
} as const

export const defaultSwapActions = {
  ...defaultSwapCreateOrderActions,
  ...defaultStateActions,
} as const

const createOrderReducer = (
  state: Readonly<SwapState>,
  action: Readonly<SwapCreateOrderAction>,
) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case SwapCreateOrderActionType.OrderTypeChanged:
        draft.createOrder.type = action.orderType
        draft.createOrder.amounts.buy = getBuyAmount(
          state.createOrder.selectedPool,
          state.createOrder.amounts.sell,
          action.orderType === 'limit'
            ? state.createOrder.limitPrice
            : undefined,
        )
        break
      case SwapCreateOrderActionType.SellAmountChanged:
        draft.createOrder.amounts.sell = action.amount
        draft.createOrder.amounts.buy = getBuyAmount(
          state.createOrder.selectedPool,
          action.amount,
          state.createOrder.type === 'limit'
            ? state.createOrder.limitPrice
            : undefined,
        )
        break
      case SwapCreateOrderActionType.BuyAmountChanged:
        draft.createOrder.amounts.buy = action.amount
        draft.createOrder.amounts.sell = getSellAmount(
          state.createOrder.selectedPool,
          action.amount,
          state.createOrder.type === 'limit'
            ? state.createOrder.limitPrice
            : undefined,
        )
        break
      case SwapCreateOrderActionType.SelectedPoolChanged:
        draft.createOrder.selectedPool = action.pool
        draft.createOrder.marketPrice = getMarketPrice(
          action.pool,
          state.createOrder.amounts.sell,
        )
        draft.createOrder.limitPrice = draft.createOrder.marketPrice
        draft.createOrder.amounts.buy = getBuyAmount(
          action.pool,
          state.createOrder.amounts.sell,
          state.createOrder.type === 'limit'
            ? draft.createOrder.limitPrice
            : undefined,
        )
        break
      case SwapCreateOrderActionType.SlippageChanged:
        draft.createOrder.slippage = action.slippage
        break
      case SwapCreateOrderActionType.TxPayloadChanged:
        draft.createOrder.datum = action.txPayload.datum
        draft.createOrder.datumHash = action.txPayload.datumHash
        draft.createOrder.address = action.txPayload.contractAddress
        break
      case SwapCreateOrderActionType.SwitchTokens:
        draft.createOrder.amounts = {
          sell: state.createOrder.amounts.buy,
          buy: state.createOrder.amounts.sell,
        }
        draft.createOrder.marketPrice = getMarketPrice(
          state.createOrder.selectedPool,
          draft.createOrder.amounts.sell,
        )
        draft.createOrder.limitPrice = draft.createOrder.marketPrice

        if (
          draft.createOrder.amounts.sell.tokenId ===
          state.createOrder.selectedPool.tokenA.tokenId
        ) {
          draft.createOrder.amounts.buy = getBuyAmount(
            state.createOrder.selectedPool,
            draft.createOrder.amounts.sell,
            state.createOrder.type === 'limit'
              ? draft.createOrder.limitPrice
              : undefined,
          )
        } else {
          draft.createOrder.amounts.sell = getSellAmount(
            state.createOrder.selectedPool,
            draft.createOrder.amounts.buy,
            state.createOrder.type === 'limit'
              ? draft.createOrder.limitPrice
              : undefined,
          )
        }
        break
      case SwapCreateOrderActionType.ResetQuantities:
        draft.createOrder.amounts = {
          sell: {
            quantity: Quantities.zero,
            tokenId: state.createOrder.amounts.sell.tokenId,
          },
          buy: {
            quantity: Quantities.zero,
            tokenId: state.createOrder.amounts.buy.tokenId,
          },
        }
        draft.createOrder.limitPrice = state.createOrder.marketPrice
        break
      case SwapCreateOrderActionType.LimitPriceChanged:
        draft.createOrder.limitPrice = action.limitPrice
        draft.createOrder.amounts.buy = getBuyAmount(
          state.createOrder.selectedPool,
          state.createOrder.amounts.sell,
          action.limitPrice,
        )
        break
    }
  })
}
const swapReducer = (state: SwapState, action: SwapAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case SwapActionType.UnsignedTxChanged:
        draft.unsignedTx = action.unsignedTx
        break
      case SwapActionType.ResetState:
        draft.createOrder = defaultSwapState.createOrder
        draft.unsignedTx = defaultSwapState.unsignedTx
        break
    }
  })
}

/* istanbul ignore next */
function missingInit() {
  console.error('[@yoroi/swap] missing initialization')
}
