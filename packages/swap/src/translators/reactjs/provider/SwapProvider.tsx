import * as React from 'react'
import {Balance, Swap} from '@yoroi/types'

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
    sellAmountChanged: (amount: Balance.Amount) => {
      dispatch({type: SwapCreateOrderActionType.SellAmountChanged, amount})
    },
    buyAmountChanged: (amount: Balance.Amount) => {
      dispatch({type: SwapCreateOrderActionType.BuyAmountChanged, amount})
    },
    selectedPoolChanged: (pool?: Swap.Pool) => {
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
    limitPriceChanged: (limitPrice: Balance.Quantity) => {
      dispatch({type: SwapCreateOrderActionType.LimitPriceChanged, limitPrice})
    },
    //
    buyQuantityChanged: (quantity: Balance.Quantity) => {
      dispatch({type: SwapCreateOrderActionType.BuyQuantityChanged, quantity})
    },
    sellQuantityChanged: (quantity: Balance.Quantity) => {
      dispatch({type: SwapCreateOrderActionType.SellQuantityChanged, quantity})
    },
    lpTokenHeldChanged: (amount: Balance.Amount | undefined) => {
      dispatch({type: SwapCreateOrderActionType.LpTokenHeldChanged, amount})
    },
    buyTokenIdChanged: (payload: {
      tokenId: Balance.TokenInfo['id']
      pools: ReadonlyArray<Swap.Pool>
    }) => {
      dispatch({type: SwapCreateOrderActionType.BuyTokenIdChanged, payload})
    },
    sellTokenIdChanged: (payload: {
      tokenId: Balance.TokenInfo['id']
      pools: ReadonlyArray<Swap.Pool>
    }) => {
      dispatch({type: SwapCreateOrderActionType.SellTokenIdChanged, payload})
    },
    poolPairsChanged: (pools: ReadonlyArray<Swap.Pool>) => {
      dispatch({type: SwapCreateOrderActionType.PoolPairsChanged, pools})
    },
  }).current

  const context = React.useMemo(
    () => ({...state, ...actions, ...swapManager}),
    [state, actions, swapManager],
  )

  return <SwapContext.Provider value={context}>{children}</SwapContext.Provider>
}
