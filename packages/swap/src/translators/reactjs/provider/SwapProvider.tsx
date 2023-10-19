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
    selectedPoolChanged: (poolId: string) => {
      dispatch({type: SwapCreateOrderActionType.SelectedPoolChanged, poolId})
    },
    slippageChanged: (newSlippage: number) => {
      dispatch({
        type: SwapCreateOrderActionType.SlippageChanged,
        slippage: newSlippage,
      })
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
    buyTokenIdChanged: (tokenId: Balance.TokenInfo['id']) => {
      dispatch({type: SwapCreateOrderActionType.BuyTokenIdChanged, tokenId})
    },
    sellTokenIdChanged: (tokenId: Balance.TokenInfo['id']) => {
      dispatch({type: SwapCreateOrderActionType.SellTokenIdChanged, tokenId})
    },
    poolPairsChanged: (pools: ReadonlyArray<Swap.Pool>) => {
      dispatch({type: SwapCreateOrderActionType.PoolPairsChanged, pools})
    },
    primaryTokenIdChanged: (tokenId: Balance.TokenInfo['id']) => {
      dispatch({type: SwapCreateOrderActionType.PrimaryTokenIdChanged, tokenId})
    },
    discountTiersChanged: (tiers: ReadonlyArray<Swap.DiscountTier>) => {
      dispatch({type: SwapCreateOrderActionType.DiscountTiersChanged, tiers})
    },
  }).current

  const context = React.useMemo(
    () => ({...state, ...actions, ...swapManager}),
    [state, actions, swapManager],
  )

  return <SwapContext.Provider value={context}>{children}</SwapContext.Provider>
}
