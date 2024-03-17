import {Exchange} from '@yoroi/types'
import {freeze, produce} from 'immer'
import {errorManagerMock} from '../../../manager.mocks'

export const exchangeReducer = (
  state: ExchangeState,
  action: ExchangeAction,
) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case ExchangeActionType.OrderTypeChanged:
        draft.orderType = action.orderType
        // resets
        draft.amount = {
          ...exchangeDefaultState.amount,
        }
        draft.canExchange = exchangeDefaultState.canExchange
        // when switching orderType it will replace the provider with the suggested one
        if (action.orderType === 'buy') {
          draft.providerId = state.providerSuggestedByOrderType.buy
          break
        }
        if (action.orderType === 'sell') {
          draft.providerId = state.providerSuggestedByOrderType.sell
          break
        }
        break

      case ExchangeActionType.AmountInputChanged:
        draft.amount = {...action.amount}
        draft.canExchange = action.canExchange
        break

      // not in use, but for now changing provider resets amount
      case ExchangeActionType.ProviderIdChanged:
        draft.providerId = action.providerId
        //resets
        draft.canExchange = exchangeDefaultState.canExchange
        draft.amount = {
          ...exchangeDefaultState.amount,
        }
        break

      default:
        throw new Error(`ExchangeFormReducer invalid action`)
    }
  })
}

export type OrderType = Exchange.ReferralUrlQueryStringParams['orderType']

export type ExchangeAction =
  | {
      type: ExchangeActionType.OrderTypeChanged
      orderType: OrderType
    }
  | {
      type: ExchangeActionType.AmountInputChanged
      amount: ExchangeState['amount']
      canExchange: ExchangeState['canExchange']
    }
  | {
      type: ExchangeActionType.ProviderIdChanged
      providerId: Exchange.Provider['id']
    }

export type ExchangeState = {
  orderType: OrderType
  providerSuggestedByOrderType: {[key in OrderType]: Exchange.Provider['id']}
  amount: {
    disabled: boolean
    error: string | undefined | null
    displayValue: string
    value: number
  }
  canExchange: boolean
  providerId: Exchange.Provider['id']
}

export const exchangeDefaultState: Readonly<ExchangeState> = freeze(
  {
    orderType: 'buy',
    providerSuggestedByOrderType: {
      buy: '',
      sell: '',
    },
    amount: {
      disabled: false,
      error: undefined,
      displayValue: '',
      value: 0,
    },
    canExchange: false,
    providerId: '',
  },
  true,
)

export enum ExchangeActionType {
  OrderTypeChanged = 'orderTypeChanged',
  AmountInputChanged = 'amountInputChanged',
  ProviderIdChanged = 'providerIdChanged',
}
export type ExchangeActions = {
  orderTypeChanged: (type: OrderType) => void
  amountInputChanged: (
    amount: ExchangeState['amount'],
    canExchange: ExchangeState['canExchange'],
  ) => void
  providerIdChanged: (providerId: Exchange.Provider['id']) => void
}

export type ExchangeContext = ExchangeState & ExchangeActions & Exchange.Manager
export const exchangeInitialExchangeContext: ExchangeContext = freeze(
  {
    ...exchangeDefaultState,
    ...errorManagerMock,
    orderTypeChanged: missingInit,
    amountInputChanged: missingInit,
    providerIdChanged: missingInit,
  },
  true,
)

/* istanbul ignore next */
function missingInit() {
  console.error('[ExchangeContext] missing initialization')
}
