import {Exchange} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import {produce} from 'immer'
import React from 'react'
import {TextInput} from 'react-native'

import {useLanguage} from '../../../i18n'
import {useSelectedWallet} from '../../../SelectedWallet'
import {useBalances} from '../../../yoroi-wallets/hooks'
import {useTokenInfo} from '../../../yoroi-wallets/hooks'
import {Amounts, Quantities} from '../../../yoroi-wallets/utils'
import {useStrings} from './useStrings'

const MIN_ADA_LIMIT = 100000000

export const useExchange = () => React.useContext(ExchangeContext)

export const ExchangeProvider = ({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: Partial<ExchangeState>
}) => {
  const wallet = useSelectedWallet()
  const tokenId = wallet.primaryTokenInfo.id
  const {numberLocale} = useLanguage()

  const amountInputRef = React.useRef<TextInput | null>(null)

  const [state, dispatch] = React.useReducer(exchangeReducer, {
    ...defaultState,
    ...initialState,
  })

  const amountTokenInfo = useTokenInfo({wallet, tokenId})

  const balances = useBalances(wallet)
  const amountBalance = Amounts.getAmount(balances, tokenId).quantity

  const strings = useStrings()

  const actions = React.useRef<ExchangeActions>({
    orderTypeChanged: (orderType: OrderType) => dispatch({type: ExchangeActionType.OrderTypeChanged, orderType}),
    canExchangeChanged: (value: boolean) => dispatch({type: ExchangeActionType.CanExchangeChanged, value}),
    amountInputDisplayValueChanged: (value: string) =>
      dispatch({type: ExchangeActionType.AmountInputDisplayValueChanged, value}),
    amountInputValueChanged: (value: number) => dispatch({type: ExchangeActionType.AmountInputValueChanged, value}),
    amountErrorChanged: (error: string | undefined) => dispatch({type: ExchangeActionType.AmountErrorChanged, error}),
    providerChanged: (provider: Exchange.Provider) => dispatch({type: ExchangeActionType.ProviderChanged, provider}),
  }).current

  const clearErrors = React.useCallback(() => {
    if (state.amount.error !== undefined) actions.amountErrorChanged(undefined)
  }, [actions, state.amount.error])

  const onChangeAmountQuantity = React.useCallback(
    (text: string) => {
      const [input, quantity] = Quantities.parseFromText(text, amountTokenInfo.decimals ?? 0, numberLocale)

      actions.amountInputDisplayValueChanged(text === '' ? '' : input)
      actions.amountInputValueChanged(+quantity)
      clearErrors()
    },
    [amountTokenInfo.decimals, numberLocale, actions, clearErrors],
  )

  const isNotEnoughBalance = new BigNumber(state.amount.value).isGreaterThan(new BigNumber(amountBalance))

  React.useEffect(() => {
    actions.canExchangeChanged(state.amount.value >= MIN_ADA_LIMIT && state.amount.error === undefined)
  }, [actions, state.amount.error, state.amount.value])

  // amount input errors
  React.useEffect(() => {
    // no enough balance error
    if (isNotEnoughBalance && state.amount.isTouched && state.orderType === 'sell') {
      actions.amountErrorChanged(strings.notEnoughBalance)
      return
    }

    if (state.amount.value > 0 && state.amount.value < MIN_ADA_LIMIT && state.orderType === 'buy') {
      actions.amountErrorChanged(strings.minAdaRequired)
      return
    }

    if (
      (!Quantities.isZero(amountBalance) && !isNotEnoughBalance && state.amount.isTouched) ||
      state.orderType === 'buy'
    ) {
      clearErrors()
      return
    }
  }, [
    actions,
    state.amount.displayValue,
    amountBalance,
    isNotEnoughBalance,
    state.amount.isTouched,
    state.orderType,
    strings.notEnoughBalance,
    clearErrors,
    state.amount.value,
    strings.minAdaRequired,
  ])

  const context = React.useMemo(
    () => ({
      ...state,
      amountInputRef,
      onChangeAmountQuantity,
      ...actions,
    }),
    [state, actions, onChangeAmountQuantity],
  )

  return <ExchangeContext.Provider value={context}>{children}</ExchangeContext.Provider>
}

const exchangeReducer = (state: ExchangeState, action: ExchangeAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case ExchangeActionType.OrderTypeChanged:
        draft.orderType = action.orderType
        break
      case ExchangeActionType.AmountInputDisplayValueChanged:
        if (state.amount.isTouched) draft.amount.displayValue = action.value
        break
      case ExchangeActionType.AmountInputValueChanged:
        if (state.amount.isTouched) draft.amount.value = action.value
        break
      case ExchangeActionType.AmountErrorChanged:
        draft.amount.error = action.error
        break
      case ExchangeActionType.CanExchangeChanged:
        draft.canExchange = action.value
        break
      case ExchangeActionType.ProviderChanged:
        draft.provider = action.provider
        break
      default:
        throw new Error(`ExchangeFormReducer invalid action`)
    }
  })
}

export type OrderType = Exchange.ReferralUrlQueryStringParams['orderType']

type ExchangeAction =
  | {type: ExchangeActionType.OrderTypeChanged; orderType: OrderType}
  | {type: ExchangeActionType.AmountInputDisplayValueChanged; value: string}
  | {type: ExchangeActionType.AmountErrorChanged; error: string | undefined}
  | {type: ExchangeActionType.AmountInputValueChanged; value: number}
  | {type: ExchangeActionType.CanExchangeChanged; value: boolean}
  | {type: ExchangeActionType.ProviderChanged; provider: Exchange.Provider}

export type ExchangeState = {
  orderType: OrderType
  amount: {
    isTouched: boolean
    disabled: boolean
    error: string | undefined
    displayValue: string
    value: number
  }
  canExchange: boolean
  provider: Exchange.Provider
}

type ExchangeActions = {
  orderTypeChanged: (type: OrderType) => void
  canExchangeChanged: (value: boolean) => void
  amountInputDisplayValueChanged: (value: string) => void
  amountErrorChanged: (error: string | undefined) => void
  amountInputValueChanged: (value: number) => void
  providerChanged: (provider: Exchange.Provider) => void
}

const defaultState: ExchangeState = Object.freeze({
  orderType: 'buy',
  amount: {
    isTouched: true,
    disabled: false,
    error: undefined,
    displayValue: '',
    value: 0,
  },
  canExchange: false,
  provider: Exchange.Provider.Banxa,
})

function missingInit() {
  console.error('[ExchangeContext] missing initialization')
}

const initialExchangeFormContext: ExchangeContext = {
  ...defaultState,
  orderTypeChanged: missingInit,
  amountInputRef: undefined,
  amountInputDisplayValueChanged: missingInit,
  amountInputValueChanged: missingInit,
  amountErrorChanged: missingInit,
  onChangeAmountQuantity: missingInit,
  canExchangeChanged: missingInit,
  providerChanged: missingInit,
}

enum ExchangeActionType {
  OrderTypeChanged = 'orderTypeChanged',
  AmountInputDisplayValueChanged = 'amountInputDisplayValueChanged',
  AmountErrorChanged = 'amountErrorChanged',
  AmountInputValueChanged = 'amountInputValueChanged',
  CanExchangeChanged = 'canExchangeChanged',
  ProviderChanged = 'providerChanged',
}

type ExchangeContext = ExchangeState &
  ExchangeActions & {
    amountInputRef: React.RefObject<TextInput> | undefined
    onChangeAmountQuantity: (text: string) => void
  }

const ExchangeContext = React.createContext<ExchangeContext>(initialExchangeFormContext)
