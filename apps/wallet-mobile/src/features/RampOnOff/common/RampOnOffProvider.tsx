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

export const useRampOnOff = () => React.useContext(RampOnOffContext)

export const RampOnOffProvider = ({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: Partial<RampOnOffState>
}) => {
  const wallet = useSelectedWallet()
  const tokenId = wallet.primaryTokenInfo.id
  const {numberLocale} = useLanguage()

  const amountInputRef = React.useRef<TextInput | null>(null)

  const [state, dispatch] = React.useReducer(rampOnOffReducer, {
    ...defaultState,
    ...initialState,
  })

  const amountTokenInfo = useTokenInfo({wallet, tokenId})

  const balances = useBalances(wallet)
  const amountBalance = Amounts.getAmount(balances, tokenId).quantity

  const strings = useStrings()

  const actions = React.useRef<RampOnOffActions>({
    orderTypeChanged: (orderType: OrderType) => dispatch({type: RampOnOffActionType.OrderTypeChanged, orderType}),
    canExchangeChanged: (value: boolean) => dispatch({type: RampOnOffActionType.CanExchangeChanged, value}),
    amountInputDisplayValueChanged: (value: string) =>
      dispatch({type: RampOnOffActionType.AmountInputDisplayValueChanged, value}),
    amountInputValueChanged: (value: number) => dispatch({type: RampOnOffActionType.AmountInputValueChanged, value}),
    amountErrorChanged: (error: string | undefined) => dispatch({type: RampOnOffActionType.AmountErrorChanged, error}),
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

  return <RampOnOffContext.Provider value={context}>{children}</RampOnOffContext.Provider>
}

const rampOnOffReducer = (state: RampOnOffState, action: RampOnOffAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case RampOnOffActionType.OrderTypeChanged:
        draft.orderType = action.orderType
        break
      case RampOnOffActionType.AmountInputDisplayValueChanged:
        if (state.amount.isTouched) draft.amount.displayValue = action.value
        break
      case RampOnOffActionType.AmountInputValueChanged:
        if (state.amount.isTouched) draft.amount.value = action.value
        break
      case RampOnOffActionType.AmountErrorChanged:
        draft.amount.error = action.error
        break
      case RampOnOffActionType.CanExchangeChanged:
        draft.canExchange = action.value
        break
      default:
        throw new Error(`RampOnOffFormReducer invalid action`)
    }
  })
}

export type OrderType = Exchange.ReferralUrlQueryStringParams['orderType']

type RampOnOffAction =
  | {type: RampOnOffActionType.OrderTypeChanged; orderType: OrderType}
  | {type: RampOnOffActionType.AmountInputDisplayValueChanged; value: string}
  | {type: RampOnOffActionType.AmountErrorChanged; error: string | undefined}
  | {type: RampOnOffActionType.AmountInputValueChanged; value: number}
  | {type: RampOnOffActionType.CanExchangeChanged; value: boolean}

export type RampOnOffState = {
  orderType: OrderType
  amount: {
    isTouched: boolean
    disabled: boolean
    error: string | undefined
    displayValue: string
    value: number
  }
  canExchange: boolean
}

type RampOnOffActions = {
  orderTypeChanged: (type: OrderType) => void
  canExchangeChanged: (value: boolean) => void
  amountInputDisplayValueChanged: (value: string) => void
  amountErrorChanged: (error: string | undefined) => void
  amountInputValueChanged: (value: number) => void
}

const defaultState: RampOnOffState = Object.freeze({
  orderType: 'buy',
  amount: {
    isTouched: true,
    disabled: false,
    error: undefined,
    displayValue: '',
    value: 0,
  },
  canExchange: false,
})

function missingInit() {
  console.error('[RampOnOffContext] missing initialization')
}

const initialSwapFormContext: RampOnOffContext = {
  ...defaultState,
  orderTypeChanged: missingInit,
  amountInputRef: undefined,
  amountInputDisplayValueChanged: missingInit,
  amountInputValueChanged: missingInit,
  amountErrorChanged: missingInit,
  onChangeAmountQuantity: missingInit,
  canExchangeChanged: missingInit,
}

enum RampOnOffActionType {
  OrderTypeChanged = 'orderTypeChanged',
  AmountInputDisplayValueChanged = 'amountInputDisplayValueChanged',
  AmountErrorChanged = 'amountErrorChanged',
  AmountInputValueChanged = 'amountInputValueChanged',
  CanExchangeChanged = 'canExchangeChanged',
}

type RampOnOffContext = RampOnOffState &
  RampOnOffActions & {
    amountInputRef: React.RefObject<TextInput> | undefined
    onChangeAmountQuantity: (text: string) => void
  }

const RampOnOffContext = React.createContext<RampOnOffContext>(initialSwapFormContext)
