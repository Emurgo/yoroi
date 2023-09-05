import {Balance, Swap} from '@yoroi/types'
import {produce} from 'immer'
import {BalanceQuantity} from '@yoroi/types/src/balance/token'

export type SwapState = Readonly<{
  createOrder: Swap.CreateOrderData & {
    type: Swap.OrderType
    datum: string
    datumHash: string
  }
  unsignedTx: any | undefined
}>

export type SwapCreateOrderActions = Readonly<{
  orderTypeChanged: (orderType: Swap.OrderType) => void
  sellAmountChanged: (sellAmount: Balance.Amount) => void
  buyAmountChanged: (buyAmount: Balance.Amount) => void
  selectedPoolChanged: (pool: Swap.PoolPair) => void
  slippageChanged: (slippage: number) => void
  txPayloadChanged: (txPayload: Swap.CreateOrderResponse) => void
  switchTokens: () => void
  resetQuantities: () => void
  limitPriceChanged: (limitPrice: BalanceQuantity) => void
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

type SwapCreateOrderAction =
  | {
      type: SwapCreateOrderActionType.OrderTypeChanged
      orderType: Swap.OrderType
    }
  | {
      type: SwapCreateOrderActionType.SellAmountChanged
      amount: Balance.Amount
    }
  | {type: SwapCreateOrderActionType.BuyAmountChanged; amount: Balance.Amount}
  | {type: SwapCreateOrderActionType.ProtocolChanged; protocol: Swap.Protocol}
  | {type: SwapCreateOrderActionType.SelectedPoolChanged; pool: Swap.PoolPair}
  | {type: SwapCreateOrderActionType.SlippageChanged; slippage: number}
  | {
      type: SwapCreateOrderActionType.TxPayloadChanged
      txPayload: Swap.CreateOrderResponse
    }
  | {type: SwapCreateOrderActionType.SwitchTokens}
  | {type: SwapCreateOrderActionType.ResetQuantities}
  | {
      type: SwapCreateOrderActionType.LimitPriceChanged
      limitPrice: BalanceQuantity
    }

export type SwapActions = Readonly<{
  unsignedTxChanged: (unsignedTx: any | undefined) => void
  resetState: () => void
}>

export enum SwapActionType {
  UnsignedTxChanged = 'unsignedTxChanged',
  ResetState = 'resetState',
}

type SwapAction =
  | {
      type: SwapActionType.UnsignedTxChanged
      unsignedTx: any | undefined
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

export const defaultSwapState: Readonly<SwapState> = {
  createOrder: {
    type: 'market',
    address: '',
    datum: '',
    datumHash: '',
    amounts: {
      sell: {
        quantity: '0',
        tokenId: '',
      },
      buy: {
        quantity: '0',
        tokenId: '',
      },
    },
    slippage: 1,
    limitPrice: undefined,
    selectedPool: {
      provider: 'minswap',
      fee: '',
      tokenA: {tokenId: '', quantity: '0'},
      tokenB: {tokenId: '', quantity: '0'},
      price: 0,
      batcherFee: {tokenId: '', quantity: '0'},
      deposit: {tokenId: '', quantity: '0'},
      poolId: '',
      lastUpdate: '',
      lpToken: {tokenId: '', quantity: '0'},
    },
  },
  unsignedTx: undefined,
} as const

const defaultSwapCreateOrderActions: SwapCreateOrderActions = {
  orderTypeChanged: (_orderType: Swap.OrderType) =>
    console.error('[@yoroi/swap] missing initialization'),
  sellAmountChanged: (_sellAmount: Balance.Amount) =>
    console.error('[@yoroi/swap] missing initialization'),
  buyAmountChanged: (_buyAmount: Balance.Amount) =>
    console.error('[@yoroi/swap] missing initialization'),
  selectedPoolChanged: (_pool: Swap.PoolPair) =>
    console.error('[@yoroi/swap] missing initialization'),
  slippageChanged: (_slippage: number) =>
    console.error('[@yoroi/swap] missing initialization'),
  txPayloadChanged: (_txPayload: Swap.CreateOrderResponse) =>
    console.error('[@yoroi/swap] missing initialization'),
  switchTokens: () => console.error('[@yoroi/swap] missing initialization'),
  resetQuantities: () => console.error('[@yoroi/swap] missing initialization'),
  limitPriceChanged: (_limitPrice: BalanceQuantity) =>
    console.error('[@yoroi/swap] missing initialization'),
} as const

const defaultStateActions: SwapActions = {
  unsignedTxChanged: (_unsignedTx: any | undefined) =>
    console.error('[@yoroi/swap] missing initialization'),
  resetState: () => console.error('[@yoroi/swap] missing initialization'),
} as const

export const defaultSwapActions = {
  ...defaultSwapCreateOrderActions,
  ...defaultStateActions,
} as const

const createOrderReducer = (
  state: SwapState,
  action: SwapCreateOrderAction,
): any => {
  switch (action.type) {
    case SwapCreateOrderActionType.OrderTypeChanged:
      return produce(state, (draft) => {
        draft.createOrder.type = action.orderType
      })
    case SwapCreateOrderActionType.SellAmountChanged:
      return produce(state, (draft) => {
        draft.createOrder.amounts.sell = action.amount
      })
    case SwapCreateOrderActionType.BuyAmountChanged:
      return produce(state, (draft) => {
        draft.createOrder.amounts.buy = action.amount
      })
    case SwapCreateOrderActionType.SelectedPoolChanged:
      return produce(state, (draft) => {
        draft.createOrder.selectedPool = action.pool
      })
    case SwapCreateOrderActionType.SlippageChanged:
      return produce(state, (draft) => {
        draft.createOrder.slippage = action.slippage
      })
    case SwapCreateOrderActionType.TxPayloadChanged:
      return produce(state, (draft) => {
        draft.createOrder.datum = action.txPayload.datum
        draft.createOrder.datumHash = action.txPayload.datumHash
        draft.createOrder.address = action.txPayload.contractAddress
      })
    case SwapCreateOrderActionType.SwitchTokens:
      return produce(state, (draft) => {
        draft.createOrder.amounts = {
          sell: state.createOrder.amounts.buy,
          buy: state.createOrder.amounts.sell,
        }
      })
    case SwapCreateOrderActionType.ResetQuantities:
      return produce(state, (draft) => {
        draft.createOrder.amounts = {
          sell: {
            quantity: '0',
            tokenId: state.createOrder.amounts.sell.tokenId,
          },
          buy: {
            quantity: '0',
            tokenId: state.createOrder.amounts.buy.tokenId,
          },
        }
        draft.createOrder.limitPrice = undefined
      })
    case SwapCreateOrderActionType.LimitPriceChanged:
      return produce(state, (draft) => {
        draft.createOrder.limitPrice = action.limitPrice
      })

    default:
      return produce(state.createOrder, () => {})
  }
}
const swapReducer = (state: SwapState, action: SwapAction) => {
  switch (action.type) {
    case SwapActionType.UnsignedTxChanged:
      return produce(state, (draft) => {
        draft.unsignedTx = action.unsignedTx
      })
    case SwapActionType.ResetState:
      return produce(defaultSwapState, () => {})

    default:
      return produce(state, () => {})
  }
}
