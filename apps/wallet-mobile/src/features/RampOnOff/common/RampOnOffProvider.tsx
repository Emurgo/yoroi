import {BanxaReferralUrlQueryStringParams} from '@yoroi/banxa/lib/typescript/translators/module'
import BigNumber from 'bignumber.js'
import {produce} from 'immer'
import React from 'react'
import {TextInput} from 'react-native'

import {useLanguage} from '../../../i18n'
import {useSelectedWallet} from '../../../SelectedWallet'
import {useBalances} from '../../../yoroi-wallets/hooks'
import {useTokenInfo} from '../../../yoroi-wallets/hooks'
import {Amounts, Quantities} from '../../../yoroi-wallets/utils'
import {actionRamp} from './mocks'
import {useStrings} from './strings'

export const useRampOnOff = () => React.useContext(RampOnOffContext)

export const RampOnOffProvider = ({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: Partial<RampOnOffState>
}) => {
  const wallet = useSelectedWallet()
  const {numberLocale} = useLanguage()

  const amountInputRef = React.useRef<TextInput | null>(null)

  const [state, dispatch] = React.useReducer(rampOnOffReducer, {
    ...defaultState,
    ...initialState,
  })

  const amountTokenInfo = useTokenInfo({wallet, tokenId: ''})

  const balances = useBalances(wallet)
  const amountBalance = Amounts.getAmount(balances, '').quantity

  const strings = useStrings()

  const actions = React.useRef<RampOnOffActions>({
    actionTypeChanged: (actionType: TRampOnOffAction) =>
      dispatch({type: RampOnOffActionType.ActionTypeChanged, actionType}),
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
      const [input] = Quantities.parseFromText(text, amountTokenInfo.decimals ?? 0, numberLocale)
      actions.amountInputDisplayValueChanged(text === '' ? '' : input)
      actions.amountInputValueChanged(isNaN(parseInt(text)) ? 0 : parseInt(text))
      actions.canExchangeChanged(text === '' || state.amount.error !== undefined ? false : true)
      clearErrors()
    },
    [amountTokenInfo.decimals, numberLocale, actions, state.amount.error, clearErrors],
  )

  const isNotEnoughBalance = new BigNumber(state.amount.value).isGreaterThan(new BigNumber(amountBalance))

  // amount input errors
  React.useEffect(() => {
    // no enough balance error
    if (isNotEnoughBalance && state.amount.isTouched && state.actionType === actionRamp.sellAda) {
      actions.amountErrorChanged(strings.notEnoughBalance)
      return
    }

    if (
      (!Quantities.isZero(amountBalance) && !isNotEnoughBalance && state.amount.isTouched) ||
      state.actionType === actionRamp.buyAda
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
    state.actionType,
    strings.notEnoughBalance,
    clearErrors,
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
      case RampOnOffActionType.ActionTypeChanged:
        draft.actionType = action.actionType
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
        throw new Error(`swapFormReducer invalid action`)
    }
  })
}

export type TRampOnOffAction = BanxaReferralUrlQueryStringParams['orderType']

type RampOnOffAction =
  | {type: RampOnOffActionType.ActionTypeChanged; actionType: TRampOnOffAction}
  | {type: RampOnOffActionType.AmountInputDisplayValueChanged; value: string}
  | {type: RampOnOffActionType.AmountErrorChanged; error: string | undefined}
  | {type: RampOnOffActionType.AmountInputValueChanged; value: number}
  | {type: RampOnOffActionType.CanExchangeChanged; value: boolean}

type RampOnOffState = {
  actionType: TRampOnOffAction
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
  actionTypeChanged: (type: TRampOnOffAction) => void
  canExchangeChanged: (value: boolean) => void
  amountInputDisplayValueChanged: (value: string) => void
  amountErrorChanged: (error: string | undefined) => void
  amountInputValueChanged: (value: number) => void
}

const defaultState: RampOnOffState = Object.freeze({
  actionType: actionRamp.buyAda,
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
  console.error('[SwapFormContext] missing initialization')
}

const initialSwapFormContext: RampOnOffContext = {
  ...defaultState,
  actionTypeChanged: missingInit,
  amountInputRef: undefined,
  amountInputDisplayValueChanged: missingInit,
  amountInputValueChanged: missingInit,
  amountErrorChanged: missingInit,
  onChangeAmountQuantity: missingInit,
  canExchangeChanged: missingInit,
}

enum RampOnOffActionType {
  ActionTypeChanged = 'actionTypeChanged',
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
