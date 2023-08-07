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
  fromAmountChanged: (fromAmount: Balance.Amount) => void
  toAmountChanged: (toAmount: Balance.Amount) => void
  protocolChanged: (protocol: Swap.Protocol) => void
  poolIdChanged: (poolId: string) => void
  slippageChanged: (slippage: number) => void
  txPayloadChanged: (txPayload: Swap.CreateOrderResponse) => void
}>

export enum SwapCreateOrderActionType {
  OrderTypeChanged = 'orderTypeChanged',
  FromAmountChanged = 'fromAmountChanged',
  ToAmountChanged = 'toAmountChanged',
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
      type: SwapCreateOrderActionType.FromAmountChanged
      fromAmount: Balance.Amount
    }
  | {type: SwapCreateOrderActionType.ToAmountChanged; toAmount: Balance.Amount}
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

export const defaultSwapState: SwapState = {
  createOrder: {
    type: 'limit',
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
    slippage: 0.1,
    protocol: 'muesliswap',
    poolId: '',
  },
  unsignedTx: undefined,
} as const

const defaultSwapCreateOrderActions: SwapCreateOrderActions = {
  orderTypeChanged: (_orderType: Swap.OrderType) =>
    console.error('[swap-react] missing initialization'),
  fromAmountChanged: (_fromAmount: Balance.Amount) =>
    console.error('[swap-react] missing initialization'),
  toAmountChanged: (_toAmount: Balance.Amount) =>
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
} as const

export const defaultSwapActions = {
  ...defaultSwapCreateOrderActions,
  ...defaultStateActions,
} as const

const createOrderReducer = (
  state: SwapState,
  action: SwapCreateOrderAction,
): SwapState['createOrder'] => {
  switch (action.type) {
    case SwapCreateOrderActionType.OrderTypeChanged:
      return produce(state.createOrder, (draft) => {
        draft.type = action.orderType
      })
    case SwapCreateOrderActionType.FromAmountChanged:
      return produce(state.createOrder, (draft) => {
        draft.amounts.sell = action.fromAmount
      })
    case SwapCreateOrderActionType.ToAmountChanged:
      return produce(state.createOrder, (draft) => {
        draft.amounts.buy = action.toAmount
      })
    case SwapCreateOrderActionType.ProtocolChanged:
      return produce(state.createOrder, (draft) => {
        draft.protocol = action.protocol
      })
    case SwapCreateOrderActionType.PoolIdChanged:
      return produce(state.createOrder, (draft) => {
        draft.poolId = action.poolId
      })
    case SwapCreateOrderActionType.SlippageChanged:
      return produce(state.createOrder, (draft) => {
        draft.slippage = action.slippage
      })
    case SwapCreateOrderActionType.TxPayloadChanged:
      return produce(state.createOrder, (draft) => {
        draft.datum = action.txPayload.datum
        draft.datumHash = action.txPayload.datumHash
        draft.address = action.txPayload.contractAddress
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
