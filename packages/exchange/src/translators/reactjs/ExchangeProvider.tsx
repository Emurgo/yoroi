import * as React from 'react'
import {Exchange} from '@yoroi/types'

import {
  ExchangeActionType,
  ExchangeActions,
  ExchangeContext,
  ExchangeState,
  OrderType,
  defaultState,
  exchangeReducer,
  initialExchangeContext,
} from './state'
import {ExchangeManager} from '../../manager'

export const ExchangeCtx = React.createContext<ExchangeContext>(
  initialExchangeContext,
)

export const ExchangeProvider = ({
  children,
  initialState,
  manager,
}: {
  children: React.ReactNode
  initialState?: Partial<ExchangeState>
  manager: ExchangeManager
}) => {
  const [state, dispatch] = React.useReducer(exchangeReducer, {
    ...defaultState,
    ...initialState,
  })

  const actions = React.useRef<ExchangeActions>({
    orderTypeChanged: (orderType: OrderType) =>
      dispatch({type: ExchangeActionType.OrderTypeChanged, orderType}),
    amountInputChanged: (input: ExchangeState['amount']) =>
      dispatch({type: ExchangeActionType.AmountInputChanged, input}),
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
