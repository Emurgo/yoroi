import * as React from 'react'
import {Portfolio, Swap} from '@yoroi/types'

import {
  SwapActionType,
  SwapActions,
  SwapCreateOrderActionType,
  SwapCreateOrderActions,
  SwapState,
  combinedSwapReducers,
  defaultSwapActions,
  defaultSwapState,
} from '../state/state'
import {mockSwapManagerDefault} from '../../../manager.mocks'

const defaultSwapManager: Swap.Manager = mockSwapManagerDefault

type SwapProviderContext = React.PropsWithChildren<
  SwapState & SwapCreateOrderActions & SwapActions & Swap.Manager
>

const initialSwapProvider: SwapProviderContext = {
  ...defaultSwapState,
  ...defaultSwapActions,
  ...defaultSwapManager,
}

export const SwapContext =
  React.createContext<SwapProviderContext>(initialSwapProvider)

export const SwapProvider = ({
  children,
  swapManager,
  initialState,
}: {
  children: React.ReactNode
  swapManager: Swap.Manager
  initialState?: SwapState
}) => {
  const [state, dispatch] = React.useReducer(combinedSwapReducers, {
    ...defaultSwapState,
    ...initialState,
  })
  const actions = React.useRef<SwapActions & SwapCreateOrderActions>({
    orderTypeChanged: (orderType: Swap.OrderType) => {
      dispatch({type: SwapCreateOrderActionType.OrderTypeChanged, orderType})
    },
    sellAmountChanged: (amount: Portfolio.Amount) => {
      dispatch({type: SwapCreateOrderActionType.SellAmountChanged, amount})
    },
    buyAmountChanged: (amount: Portfolio.Amount) => {
      dispatch({type: SwapCreateOrderActionType.BuyAmountChanged, amount})
    },
    selectedPoolChanged: (pool: Swap.Pool) => {
      dispatch({type: SwapCreateOrderActionType.SelectedPoolChanged, pool})
    },
    slippageChanged: (newSlippage: number) => {
      dispatch({
        type: SwapCreateOrderActionType.SlippageChanged,
        slippage: newSlippage,
      })
    },
    txPayloadChanged: (txPayload: Swap.CreateOrderResponse) => {
      dispatch({type: SwapCreateOrderActionType.TxPayloadChanged, txPayload})
    },
    switchTokens: () => {
      dispatch({type: SwapCreateOrderActionType.SwitchTokens})
    },
    resetQuantities: () => {
      dispatch({type: SwapCreateOrderActionType.ResetQuantities})
    },
    unsignedTxChanged: (unsignedTx: any) => {
      dispatch({type: SwapActionType.UnsignedTxChanged, unsignedTx})
    },
    resetState: () => {
      dispatch({type: SwapActionType.ResetState})
    },
    limitPriceChanged: (limitPrice: Portfolio.Quantity) => {
      dispatch({type: SwapCreateOrderActionType.LimitPriceChanged, limitPrice})
    },
  }).current

  const context = React.useMemo(
    () => ({...state, ...actions, ...swapManager}),
    [state, actions, swapManager],
  )

  return <SwapContext.Provider value={context}>{children}</SwapContext.Provider>
}
