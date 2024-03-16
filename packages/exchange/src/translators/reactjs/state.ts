import {Exchange} from '@yoroi/types'
import {freeze, produce} from 'immer'
import {ExchangeManager} from '../../manager'
import {managerMocks} from '../../manager.mocks'

export const exchangeReducer = (
  state: ExchangeState,
  action: ExchangeAction,
) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case ExchangeActionType.OrderTypeChanged:
        draft.orderType = action.orderType

        // TODO: this should come from the state already after the warm up
        if (action.orderType === 'buy') {
          draft.providerId = 'banxa'
        } else {
          draft.providerId = 'encryptus'
        }
        // what else should happen?
        // on ui maybe it should check for the balance or reset the input
        // derive the reset of the state from the ui
        // reset inputs?
        // reset can exchange?
        break
      case ExchangeActionType.AmountInputChanged:
        /// --> errors, displayValue --> --> handler,
        // entire input as one action InputChanged, all the input is calculated on UI side
        // if error if not balance
        // if touched
        // update can exchange
        break
      // case ExchangeActionType.CanExchangeChanged:
      // it should be a derived state - maybe it can be dropped
      // when changing provider what happens by ProviderChanged
      // when changing the order type what happens by OrderTypeChanged
      // when updating the amount what happens by AmountInputValueChanged
      case ExchangeActionType.ProviderIdChanged:
        // what should happen?
        // 1. reset input
        // 2. clearn input error
        // 3. reset can exchange ?
        draft.providerId = action.providerId
        break
      default:
        throw new Error(`ExchangeFormReducer invalid action`)
    }
  })
}

export type OrderType = Exchange.ReferralUrlQueryStringParams['orderType']

type ExchangeAction =
  | {
      type: ExchangeActionType.OrderTypeChanged
      orderType: OrderType
    }
  | {
      type: ExchangeActionType.AmountInputChanged
      input: ExchangeState['amount']
    }
  | {
      type: ExchangeActionType.ProviderIdChanged
      providerId: Exchange.Provider['id']
    }

export type ExchangeState = {
  orderType: OrderType
  providerSuggestedByOrderType: {[key in OrderType]: Exchange.Provider['id']}
  amount: {
    isTouched: boolean
    disabled: boolean
    error: string | undefined | null
    displayValue: string
    value: number
  }
  canExchange: boolean
  providerId: Exchange.Provider['id']
}

export const defaultState: Readonly<ExchangeState> = freeze(
  {
    orderType: 'buy',
    // TODO: first action to dispatch while mounting at first time
    providerSuggestedByOrderType: {
      buy: '',
      sell: '',
    },
    amount: {
      isTouched: true,
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
  amountInputChanged: (input: ExchangeState['amount']) => void
  providerIdChanged: (providerId: Exchange.Provider['id']) => void
}

export type ExchangeContext = ExchangeState & ExchangeActions & ExchangeManager
export const initialExchangeContext: ExchangeContext = freeze(
  {
    ...defaultState,
    ...managerMocks.error,
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
