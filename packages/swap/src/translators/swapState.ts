import {Balance, Swap} from '@yoroi/types'
import {produce} from 'immer'

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
  protocolChanged: (protocol: Swap.Protocol) => void
  poolIdChanged: (poolId: string) => void
  slippageChanged: (slippage: number) => void
  txPayloadChanged: (txPayload: Swap.CreateOrderResponse) => void
}>

export enum SwapCreateOrderActionType {
  OrderTypeChanged = 'orderTypeChanged',
  SellAmountChanged = 'sellAmountChanged',
  BuyAmountChanged = 'buyAmountChanged',
  ProtocolChanged = 'protocolChanged',
  PoolIdChanged = 'poolIdChanged',
  SlippageChanged = 'slippageChanged',
  TxPayloadChanged = 'txPayloadChanged',
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
  | {type: SwapCreateOrderActionType.PoolIdChanged; poolId: string}
  | {type: SwapCreateOrderActionType.SlippageChanged; slippage: number}
  | {
      type: SwapCreateOrderActionType.TxPayloadChanged
      txPayload: Swap.CreateOrderResponse
    }

export type SwapActions = Readonly<{
  unsignedTxChanged: (unsignedTx: any | undefined) => void
  resetState: () => void
  switchTokens: () => void
}>

export enum SwapActionType {
  UnsignedTxChanged = 'unsignedTxChanged',
  ResetState = 'resetState',
  SwitchTokens = 'switchTokens',
}

type SwapAction =
  | {
      type: SwapActionType.UnsignedTxChanged
      unsignedTx: any | undefined
    }
  | {type: SwapActionType.ResetState}
  | {type: SwapActionType.SwitchTokens}

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
    protocol: 'muesliswap',
    poolId: '',
  },
  unsignedTx: undefined,
} as const

const defaultSwapCreateOrderActions: SwapCreateOrderActions = {
  orderTypeChanged: (_orderType: Swap.OrderType) =>
    console.error('[swap-react] missing initialization'),
  sellAmountChanged: (_sellAmount: Balance.Amount) =>
    console.error('[swap-react] missing initialization'),
  buyAmountChanged: (_buyAmount: Balance.Amount) =>
    console.error('[swap-react] missing initialization'),
  protocolChanged: (_protocol: Swap.Protocol) =>
    console.error('[swap-react] missing initialization'),
  poolIdChanged: (_poolId: string) =>
    console.error('[swap-react] missing initialization'),
  slippageChanged: (_slippage: number) =>
    console.error('[swap-react] missing initialization'),
  txPayloadChanged: (_txPayload: Swap.CreateOrderResponse) =>
    console.error('[swap-react] missing initialization'),
} as const

const defaultStateActions: SwapActions = {
  unsignedTxChanged: (_unsignedTx: any | undefined) =>
    console.error('[swap-react] missing initialization'),
  resetState: () => console.error('[swap-react] missing initialization'),
  switchTokens: () => console.error('[swap-react] missing initialization'),
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
    case SwapCreateOrderActionType.ProtocolChanged:
      return produce(state, (draft) => {
        draft.createOrder.protocol = action.protocol
      })
    case SwapCreateOrderActionType.PoolIdChanged:
      return produce(state, (draft) => {
        draft.createOrder.poolId = action.poolId
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
    case SwapActionType.SwitchTokens:
      return {
        ...state,
        createOrder: {
          ...state.createOrder,
          amounts: {
            sell: state.createOrder.amounts.buy,
            buy: state.createOrder.amounts.sell,
          },
        },
      }
    default:
      return produce(state, () => {})
  }
}
