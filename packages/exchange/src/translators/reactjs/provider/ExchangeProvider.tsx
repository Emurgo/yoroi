import * as React from 'react'
import {Exchange} from '@yoroi/types'

import {
  ExchangeActionType,
  ExchangeActions,
  ExchangeContext,
  ExchangeState,
  OrderType,
  exchangeDefaultState,
  exchangeReducer,
  exchangeInitialExchangeContext,
} from '../state/state'

export const ExchangeCtx = React.createContext<ExchangeContext>(
  exchangeInitialExchangeContext,
)

export const ExchangeProvider = ({
  children,
  initialState,
  manager,
}: {
  children: React.ReactNode
  initialState?: Partial<ExchangeState>
  manager: Exchange.Manager
}) => {
  const [state, dispatch] = React.useReducer(exchangeReducer, {
    ...exchangeDefaultState,
    ...initialState,
  })

  const actions = React.useRef<ExchangeActions>({
    orderTypeChanged: (orderType: OrderType) =>
      dispatch({type: ExchangeActionType.OrderTypeChanged, orderType}),
    amountInputChanged: (
      amount: ExchangeState['amount'],
      canExchange: ExchangeState['canExchange'],
    ) =>
      dispatch({
        type: ExchangeActionType.AmountInputChanged,
        amount,
        canExchange,
      }),
    providerIdChanged: (providerId: Exchange.Provider['id']) =>
      dispatch({type: ExchangeActionType.ProviderIdChanged, providerId}),
  }).current

  const context = React.useMemo(
    () => ({
      ...state,
      ...actions,
      ...manager,
    }),
    [state, actions, manager],
  )

  return <ExchangeCtx.Provider value={context}>{children}</ExchangeCtx.Provider>
}
