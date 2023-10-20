import {useSwap} from '@yoroi/swap'
import {produce} from 'immer'
import React from 'react'
import {Keyboard, TextInput} from 'react-native'

import {useLanguage} from '../../../i18n'
import {useSelectedWallet} from '../../../SelectedWallet'
import {useBalances, useTokenInfo} from '../../../yoroi-wallets/hooks'
import {Amounts, Quantities} from '../../../yoroi-wallets/utils'
import {useStrings} from './strings'

export const useSwapForm = () => React.useContext(SwapFormContext)

export const SwapFormProvider = ({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: Partial<SwapFormState>
}) => {
  const {
    orderData,
    resetState,
    buyQuantityChanged,
    sellQuantityChanged,
    switchTokens,
    limitPriceChanged,
    resetQuantities,
  } = useSwap()
  const wallet = useSelectedWallet()
  const {numberLocale} = useLanguage()
  const strings = useStrings()

  const buyInputRef = React.useRef<TextInput | null>(null)
  const sellInputRef = React.useRef<TextInput | null>(null)
  const limitInputRef = React.useRef<TextInput | null>(null)

  const pool = orderData.selectedPoolCalculation?.pool
  const {tokenId: buyTokenId, quantity: buyQuantity} = orderData.amounts.buy
  const {tokenId: sellTokenId, quantity: sellQuantity} = orderData.amounts.sell

  const buyTokenInfo = useTokenInfo({wallet, tokenId: orderData.amounts.buy.tokenId})
  const sellTokenInfo = useTokenInfo({wallet, tokenId: orderData.amounts.sell.tokenId})

  const balances = useBalances(wallet)
  const sellbalance = Amounts.getAmount(balances, sellTokenId).quantity
  const primaryTokenBalance = Amounts.getAmount(balances, wallet.primaryTokenInfo.id).quantity

  const poolSupply = buyTokenId === pool?.tokenA.tokenId ? pool?.tokenA.quantity : pool?.tokenB.quantity
  const hasBuyTokenSupply = !Quantities.isGreaterThan(buyQuantity, poolSupply ?? Quantities.zero)
  const hasSellBalance = !Quantities.isGreaterThan(sellQuantity, sellbalance)
  const hasFeesBalance = !Quantities.isGreaterThan(
    Quantities.sum([
      sellTokenId === wallet.primaryTokenInfo.id ? sellQuantity : Quantities.zero,
      orderData.selectedPoolCalculation?.cost.ptTotalFeeNoFEF.quantity ?? Quantities.zero,
    ]),
    primaryTokenBalance,
  )

  const denomination = (sellTokenInfo.decimals ?? 0) - (buyTokenInfo.decimals ?? 0)

  const [state, dispatch] = React.useReducer(swapFormReducer, {
    ...defaultState,
    buyQuantity: {
      ...defaultState.buyQuantity,
      displayValue: Quantities.format(buyQuantity, buyTokenInfo.decimals ?? 0),
    },
    sellQuantity: {
      ...defaultState.sellQuantity,
      displayValue: Quantities.format(sellQuantity, sellTokenInfo.decimals ?? 0),
    },
    ...initialState,
  })

  const noPoolError =
    orderData.selectedPoolCalculation === undefined && state.buyQuantity.isTouched && state.sellQuantity.isTouched
      ? strings.noPool
      : undefined

  const buyError =
    noPoolError !== undefined
      ? noPoolError
      : (!Quantities.isZero(buyQuantity) && !hasBuyTokenSupply) ||
        (state.sellQuantity.isTouched && state.buyQuantity.isTouched && pool === undefined)
      ? strings.notEnoughSupply
      : undefined

  const sellError =
    noPoolError !== undefined
      ? noPoolError
      : !Quantities.isZero(sellQuantity) && !hasSellBalance
      ? strings.notEnoughBalance
      : !Quantities.isZero(sellQuantity) && state.buyQuantity.isTouched && !hasFeesBalance
      ? strings.notEnoughFeeBalance
      : undefined

  const canSwap =
    state.buyQuantity.isTouched &&
    state.sellQuantity.isTouched &&
    !Quantities.isZero(buyQuantity) &&
    !Quantities.isZero(sellQuantity) &&
    state.buyQuantity.error === undefined &&
    state.sellQuantity.error === undefined &&
    ((orderData.type === 'limit' && orderData.limitPrice !== undefined && !Quantities.isZero(orderData.limitPrice)) ||
      orderData.selectedPoolCalculation !== undefined)

  const actions = React.useRef<SwapFormActions>({
    sellTouched: () => dispatch({type: SwapFormActionType.SellTouched}),
    buyTouched: () => dispatch({type: SwapFormActionType.BuyTouched}),
    switchTouched: () => dispatch({type: SwapFormActionType.SwitchTouched}),
    switchTokens: () => {
      switchTokens()
      dispatch({type: SwapFormActionType.SwitchTouched})
    },
    poolTouched: () => dispatch({type: SwapFormActionType.PoolTouched}),
    poolDefaulted: () => dispatch({type: SwapFormActionType.PoolDefaulted}),
    clearSwapForm: () => {
      resetQuantities()
      dispatch({type: SwapFormActionType.ClearSwapForm})

      // In certain iOS simulators, the focused input's `onChangeText` may be called before dismissal, using the previous input value.
      Keyboard.dismiss()
    },
    resetSwapForm: () => {
      resetState()
      dispatch({type: SwapFormActionType.ResetSwapForm})
    },
    canSwapChanged: (canSwap: boolean) => dispatch({type: SwapFormActionType.CanSwapChanged, canSwap}),
    buyInputValueChanged: (value: string) => dispatch({type: SwapFormActionType.BuyInputValueChanged, value}),
    sellInputValueChanged: (value: string) => dispatch({type: SwapFormActionType.SellInputValueChanged, value}),
    limitPriceInputValueChanged: (value: string) =>
      dispatch({type: SwapFormActionType.LimitPriceInputValueChanged, value}),
    buyAmountErrorChanged: (error: string | undefined) =>
      dispatch({type: SwapFormActionType.BuyAmountErrorChanged, error}),
    sellAmountErrorChanged: (error: string | undefined) =>
      dispatch({type: SwapFormActionType.SellAmountErrorChanged, error}),
  }).current

  const updateSellInput = React.useCallback(() => {
    if (state.sellQuantity.isTouched && !sellInputRef?.current?.isFocused()) {
      actions.sellInputValueChanged(Quantities.format(sellQuantity, sellTokenInfo.decimals ?? 0))
    }
  }, [actions, sellQuantity, sellTokenInfo.decimals, state.sellQuantity.isTouched])

  const updateBuyInput = React.useCallback(() => {
    if (state.buyQuantity.isTouched && !buyInputRef?.current?.isFocused()) {
      actions.buyInputValueChanged(Quantities.format(buyQuantity, buyTokenInfo.decimals ?? 0))
    }
  }, [actions, buyTokenInfo.decimals, buyQuantity, state.buyQuantity.isTouched])

  const updateLimitPrice = React.useCallback(() => {
    if (orderData.type === 'limit' && !limitInputRef?.current?.isFocused()) {
      actions.limitPriceInputValueChanged(
        Quantities.format(orderData.limitPrice ?? Quantities.zero, denomination, PRECISION),
      )
    } else if (orderData.type === 'market') {
      actions.limitPriceInputValueChanged(
        Quantities.format(orderData.selectedPoolCalculation?.prices.market ?? Quantities.zero, denomination, PRECISION),
      )
    }
  }, [actions, denomination, orderData.limitPrice, orderData.selectedPoolCalculation?.prices.market, orderData.type])

  const onChangeSellQuantity = React.useCallback(
    (text: string) => {
      const [input, quantity] = Quantities.parseFromText(text, sellTokenInfo.decimals ?? 0, numberLocale)
      sellQuantityChanged(quantity)
      actions.sellInputValueChanged(text === '' ? '' : input)

      if (sellError === undefined) actions.sellAmountErrorChanged(undefined)
      if (buyError === undefined) actions.buyAmountErrorChanged(undefined)
    },
    [actions, buyError, numberLocale, sellError, sellQuantityChanged, sellTokenInfo.decimals],
  )

  const onChangeBuyQuantity = React.useCallback(
    (text: string) => {
      const [input, quantity] = Quantities.parseFromText(text, buyTokenInfo.decimals ?? 0, numberLocale)
      buyQuantityChanged(quantity)
      actions.buyInputValueChanged(text === '' ? '' : input)

      if (buyError === undefined) actions.buyAmountErrorChanged(undefined)
      if (sellError === undefined) actions.sellAmountErrorChanged(undefined)
    },
    [actions, buyError, buyQuantityChanged, buyTokenInfo.decimals, numberLocale, sellError],
  )

  const onChangeLimitPrice = React.useCallback(
    (text: string) => {
      const [formattedPrice, price] = Quantities.parseFromText(text, denomination, numberLocale, PRECISION)
      actions.limitPriceInputValueChanged(formattedPrice)
      limitPriceChanged(price)

      if (buyError === undefined) actions.buyAmountErrorChanged(undefined)
      if (sellError === undefined) actions.sellAmountErrorChanged(undefined)
    },
    [actions, buyError, denomination, limitPriceChanged, numberLocale, sellError],
  )

  React.useEffect(() => {
    if (buyError !== state.buyQuantity.error && buyError !== undefined) actions.buyAmountErrorChanged(buyError)
  }, [actions, buyError, state.buyQuantity.error])

  React.useEffect(() => {
    if (sellError !== state.sellQuantity.error && sellError !== undefined) {
      actions.sellAmountErrorChanged(sellError)
    }
  }, [actions, sellError, state.sellQuantity.error])

  React.useEffect(() => {
    if (canSwap !== state.canSwap) actions.canSwapChanged(canSwap)
  }, [actions, canSwap, state.canSwap])

  React.useEffect(() => {
    updateSellInput()
  }, [sellQuantity, updateSellInput])

  React.useEffect(() => {
    updateBuyInput()
  }, [buyQuantity, updateBuyInput])

  React.useEffect(() => {
    updateLimitPrice()
  }, [orderData.limitPrice, orderData.selectedPoolCalculation?.prices.market, orderData.type, updateLimitPrice])

  const context = React.useMemo(
    () => ({
      ...state,
      buyInputRef,
      sellInputRef,
      limitInputRef,
      onChangeSellQuantity,
      onChangeBuyQuantity,
      onChangeLimitPrice,
      ...actions,
    }),
    [state, onChangeSellQuantity, onChangeBuyQuantity, onChangeLimitPrice, actions],
  )

  return <SwapFormContext.Provider value={context}>{children}</SwapFormContext.Provider>
}

const swapFormReducer = (state: SwapFormState, action: SwapFormAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case SwapFormActionType.SellTouched:
        draft.sellQuantity.isTouched = true

        break

      case SwapFormActionType.BuyTouched:
        draft.buyQuantity.isTouched = true

        break

      case SwapFormActionType.SwitchTouched:
        draft.sellQuantity.isTouched = state.buyQuantity.isTouched
        draft.buyQuantity.isTouched = state.sellQuantity.isTouched

        break

      case SwapFormActionType.PoolTouched:
        draft.selectedPool.isTouched = true

        break

      case SwapFormActionType.PoolDefaulted:
        draft.selectedPool = defaultState.selectedPool

        break

      case SwapFormActionType.ResetSwapForm:
      case SwapFormActionType.ClearSwapForm:
        return defaultState

      case SwapFormActionType.CanSwapChanged:
        draft.canSwap = action.canSwap

        break

      case SwapFormActionType.SellInputValueChanged:
        draft.sellQuantity.displayValue = action.value

        break

      case SwapFormActionType.BuyInputValueChanged:
        draft.buyQuantity.displayValue = action.value

        break

      case SwapFormActionType.LimitPriceInputValueChanged:
        draft.limitPrice.displayValue = action.value

        break

      case SwapFormActionType.SellAmountErrorChanged:
        draft.sellQuantity.error = action.error

        break

      case SwapFormActionType.BuyAmountErrorChanged:
        draft.buyQuantity.error = action.error

        break

      default:
        throw new Error(`swapFormReducer invalid action`)
    }
  })
}

const PRECISION = 14

const defaultState: SwapFormState = Object.freeze({
  sellQuantity: {
    isTouched: true,
    disabled: false,
    error: undefined,
    displayValue: '',
  },
  buyQuantity: {
    isTouched: false,
    disabled: false,
    error: undefined,
    displayValue: '',
  },
  selectedPool: {
    isTouched: false,
  },
  limitPrice: {
    displayValue: '',
  },
  canSwap: false,
})

/* istanbul ignore next */
function missingInit() {
  console.error('[SwapFormContext] missing initialization')
}

const initialSwapFormContext: SwapFormContext = {
  ...defaultState,
  sellTouched: missingInit,
  buyTouched: missingInit,
  poolTouched: missingInit,
  poolDefaulted: missingInit,
  switchTouched: missingInit,
  switchTokens: missingInit,
  clearSwapForm: missingInit,
  resetSwapForm: missingInit,
  buyInputValueChanged: missingInit,
  sellInputValueChanged: missingInit,
  limitPriceInputValueChanged: missingInit,
  buyAmountErrorChanged: missingInit,
  sellAmountErrorChanged: missingInit,
  canSwapChanged: missingInit,
  sellInputRef: undefined,
  buyInputRef: undefined,
  limitInputRef: undefined,
  onChangeSellQuantity: missingInit,
  onChangeBuyQuantity: missingInit,
  onChangeLimitPrice: missingInit,
}

type SwapFormAction =
  | {type: SwapFormActionType.SellTouched}
  | {type: SwapFormActionType.BuyTouched}
  | {type: SwapFormActionType.SwitchTouched}
  | {type: SwapFormActionType.PoolTouched}
  | {type: SwapFormActionType.PoolDefaulted}
  | {type: SwapFormActionType.ClearSwapForm}
  | {type: SwapFormActionType.ResetSwapForm}
  | {type: SwapFormActionType.CanSwapChanged; canSwap: boolean}
  | {type: SwapFormActionType.SellInputValueChanged; value: string}
  | {type: SwapFormActionType.BuyInputValueChanged; value: string}
  | {type: SwapFormActionType.SellAmountErrorChanged; error: string | undefined}
  | {type: SwapFormActionType.LimitPriceInputValueChanged; value: string}
  | {type: SwapFormActionType.BuyAmountErrorChanged; error: string | undefined}

type SwapFormState = {
  sellQuantity: {
    isTouched: boolean
    disabled: boolean
    error: string | undefined
    displayValue: string
  }
  buyQuantity: {
    isTouched: boolean
    disabled: boolean
    error: string | undefined
    displayValue: string
  }
  selectedPool: {
    isTouched: boolean
  }
  limitPrice: {
    displayValue: string
  }
  canSwap: boolean
}
type SwapFormActions = {
  sellTouched: () => void
  buyTouched: () => void
  switchTouched: () => void
  switchTokens: () => void
  poolTouched: () => void
  poolDefaulted: () => void
  clearSwapForm: () => void
  resetSwapForm: () => void
  canSwapChanged: (canSwap: boolean) => void
  buyInputValueChanged: (value: string) => void
  sellInputValueChanged: (value: string) => void
  limitPriceInputValueChanged: (value: string) => void
  buyAmountErrorChanged: (error: string | undefined) => void
  sellAmountErrorChanged: (error: string | undefined) => void
}

enum SwapFormActionType {
  SellTouched = 'sellTouched',
  BuyTouched = 'buyTouched',
  SwitchTouched = 'switchTouched',
  SwitchTokens = 'switchTokens',
  PoolTouched = 'poolTouched',
  PoolDefaulted = 'poolDefaulted',
  ClearSwapForm = 'clearSwapForm',
  ResetSwapForm = 'resetSwapForm',
  CanSwapChanged = 'canSwapChanged',
  BuyInputValueChanged = 'buyInputValueChanged',
  SellInputValueChanged = 'sellInputValueChanged',
  LimitPriceInputValueChanged = 'limitPriceInputValueChanged',
  SellAmountErrorChanged = 'sellAmountErrorChanged',
  BuyAmountErrorChanged = 'buyAmountErrorChanged',
}

type SwapFormContext = SwapFormState &
  SwapFormActions & {
    sellInputRef: React.RefObject<TextInput> | undefined
    buyInputRef: React.RefObject<TextInput> | undefined
    limitInputRef: React.RefObject<TextInput> | undefined
    onChangeSellQuantity: (text: string) => void
    onChangeBuyQuantity: (text: string) => void
    onChangeLimitPrice: (text: string) => void
  }

const SwapFormContext = React.createContext<SwapFormContext>(initialSwapFormContext)
