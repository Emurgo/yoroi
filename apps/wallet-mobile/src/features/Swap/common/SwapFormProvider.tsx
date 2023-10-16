import {useSwap} from '@yoroi/swap'
import React from 'react'
import {Alert, TextInput} from 'react-native'

import {useLanguage} from '../../../i18n'
import {useSelectedWallet} from '../../../SelectedWallet'
import {useBalances, useTokenInfo} from '../../../yoroi-wallets/hooks'
import {Amounts, Quantities} from '../../../yoroi-wallets/utils'
import {useStrings} from './strings'

type SwapFormState = {
  sellAmount: {
    isTouched: boolean
    disabled: boolean
    error: string | undefined
    displayValue: string
  }
  buyAmount: {
    isTouched: boolean
    disabled: boolean
    error: string | undefined
    displayValue: string
  }
  selectedPool: {
    isTouched: boolean
  }
}
type SwapFormActions = {
  sellTouched: () => void
  buyTouched: () => void
  switchTouched: () => void
  poolTouched: () => void
  poolDefaulted: () => void
  resetTouches: () => void
  setBuyInputValue: (value: string) => void
  setSellInputValue: (value: string) => void
  setBuyAmountError: (error: string | undefined) => void
  setSellAmountError: (error: string | undefined) => void
}

const SwapFormContext = React.createContext<
  | undefined
  | (SwapFormState &
      SwapFormActions & {
        sellInputRef: React.RefObject<TextInput>
        buyInputRef: React.RefObject<TextInput>
        onChangeSellQuantity: (value: string) => void
        onChangeBuyQuantity: (value: string) => void
      })
>(undefined)

export const useSwapForm = () => {
  const value = React.useContext(SwapFormContext)
  if (!value) {
    throw new Error('useSwapForm must be used within a SwapFormProvider')
  }
  return value
}

export const SwapFormProvider = ({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: Partial<SwapFormState>
}) => {
  const {orderData, buyQuantityChanged, sellQuantityChanged} = useSwap()
  const wallet = useSelectedWallet()
  const {numberLocale} = useLanguage()
  const strings = useStrings()
  const buyInputRef = React.useRef<TextInput>(null)
  const sellInputRef = React.useRef<TextInput>(null)

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
  const hasSellBalance = !Quantities.isGreaterThan(orderData.amounts.sell.quantity, sellbalance)
  const hasFeesBalance = !Quantities.isGreaterThan(
    Quantities.sum([
      sellTokenId === wallet.primaryTokenInfo.id ? orderData.amounts.sell.quantity : Quantities.zero,
      orderData.selectedPoolCalculation?.cost.ptTotalFeeNoFEF.quantity ?? Quantities.zero,
    ]),
    primaryTokenBalance,
  )

  const [state, dispatch] = React.useReducer(swapFormReducer, {
    ...defaultState,
    buyAmount: {
      ...defaultState.buyAmount,
      displayValue: Quantities.format(orderData.amounts.buy.quantity, buyTokenInfo.decimals ?? 0),
    },
    sellAmount: {
      ...defaultState.sellAmount,
      displayValue: Quantities.format(orderData.amounts.sell.quantity, buyTokenInfo.decimals ?? 0),
    },
    ...initialState,
  })

  const noPoolError =
    orderData.selectedPoolCalculation === undefined && state.buyAmount.isTouched && state.sellAmount.isTouched
      ? strings.noPool
      : undefined

  const buyError =
    noPoolError !== undefined
      ? noPoolError
      : (!Quantities.isZero(buyQuantity) && !hasBuyTokenSupply) ||
        (state.sellAmount.isTouched && state.buyAmount.isTouched && pool === undefined)
      ? strings.notEnoughSupply
      : undefined

  const sellError =
    noPoolError !== undefined
      ? noPoolError
      : !Quantities.isZero(sellQuantity) && state.buyAmount.isTouched && !hasSellBalance
      ? strings.notEnoughBalance
      : !Quantities.isZero(sellQuantity) && state.buyAmount.isTouched && !hasFeesBalance
      ? strings.notEnoughFeeBalance
      : undefined

  const actions = React.useRef<SwapFormActions>({
    sellTouched: () => dispatch({type: 'sellTouched'}),
    buyTouched: () => dispatch({type: 'buyTouched'}),
    switchTouched: () => dispatch({type: 'switchTouched'}),
    poolTouched: () => dispatch({type: 'poolTouched'}),
    poolDefaulted: () => dispatch({type: 'poolDefaulted'}),
    resetTouches: () => dispatch({type: 'resetTouches'}),
    setBuyInputValue: (value: string) => dispatch({type: 'setBuyInputValue', value}),
    setSellInputValue: (value: string) => dispatch({type: 'setSellInputValue', value}),
    setBuyAmountError: (error: string | undefined) => dispatch({type: 'setBuyAmountError', error}),
    setSellAmountError: (error: string | undefined) => dispatch({type: 'setSellAmountError', error}),
  }).current

  React.useEffect(() => {
    if (state.buyAmount.isTouched && !buyInputRef?.current?.isFocused()) {
      actions.setBuyInputValue(Quantities.format(orderData.amounts.buy.quantity, buyTokenInfo.decimals ?? 0))
    }
  }, [state.buyAmount.isTouched, orderData.amounts.buy.quantity, buyTokenInfo.decimals, actions])

  React.useEffect(() => {
    if (state.sellAmount.isTouched && !sellInputRef?.current?.isFocused()) {
      actions.setSellInputValue(Quantities.format(orderData.amounts.sell.quantity, sellTokenInfo.decimals ?? 0))
    }
  }, [actions, state.sellAmount.isTouched, orderData.amounts.sell.quantity, sellTokenInfo.decimals])

  React.useEffect(() => {
    if (sellError !== state.sellAmount.error) actions.setSellAmountError(sellError)
  }, [actions, sellError, state.sellAmount.error])

  React.useEffect(() => {
    if (buyError !== state.buyAmount.error) actions.setBuyAmountError(buyError)
  }, [actions, buyError, state.buyAmount.error])

  const onChangeSellQuantity = React.useCallback(
    (text: string) => {
      try {
        const [input, quantity] = Quantities.parseFromText(text, sellTokenInfo.decimals ?? 0, numberLocale)
        sellQuantityChanged(quantity)
        actions.setSellInputValue(text === '' ? text : input)
      } catch (error) {
        Alert.alert(strings.generalErrorTitle, strings.generalErrorMessage(error))
      }
    },
    [actions, numberLocale, sellQuantityChanged, sellTokenInfo.decimals, strings],
  )

  const onChangeBuyQuantity = React.useCallback(
    (text: string) => {
      try {
        const [input, quantity] = Quantities.parseFromText(text, buyTokenInfo.decimals ?? 0, numberLocale)
        buyQuantityChanged(quantity)
        actions.setBuyInputValue(text === '' ? text : input)
      } catch (error) {
        Alert.alert(strings.generalErrorTitle, strings.generalErrorMessage(error))
      }
    },
    [actions, buyQuantityChanged, buyTokenInfo.decimals, numberLocale, strings],
  )

  const context = React.useMemo(
    () => ({...state, buyInputRef, sellInputRef, onChangeSellQuantity, onChangeBuyQuantity, ...actions}),
    [state, onChangeSellQuantity, onChangeBuyQuantity, actions],
  )

  return <SwapFormContext.Provider value={context}>{children}</SwapFormContext.Provider>
}

type SwapFormAction =
  | {type: 'sellTouched'}
  | {type: 'buyTouched'}
  | {type: 'switchTouched'}
  | {type: 'poolTouched'}
  | {type: 'poolDefaulted'}
  | {type: 'resetTouches'}
  | {type: 'setBuyInputValue'; value: string}
  | {type: 'setSellInputValue'; value: string}
  | {type: 'setBuyAmountError'; error: string | undefined}
  | {type: 'setSellAmountError'; error: string | undefined}

const swapFormReducer = (state: SwapFormState, action: SwapFormAction) => {
  console.log('action.type', action.type)
  switch (action.type) {
    case 'sellTouched':
      return {
        ...state,
        sellAmount: {
          ...state.sellAmount,
          isTouched: true,
        },
      }

    case 'buyTouched':
      return {
        ...state,
        buyAmount: {
          ...state.buyAmount,
          isTouched: true,
        },
      }

    case 'switchTouched':
      return {
        ...state,
        isSellTouched: state.buyAmount.isTouched,
        isBuyTouched: state.sellAmount.isTouched,
      }

    case 'poolTouched':
      return {
        ...state,
        selectedPool: {
          ...state.selectedPool,
          isTouched: true,
        },
      }

    case 'poolDefaulted':
      return {
        ...state,
        selectedPool: {
          ...defaultState.selectedPool,
        },
      }

    case 'resetTouches':
      return defaultState

    case 'setBuyInputValue': {
      return {
        ...state,
        buyAmount: {
          ...state.buyAmount,
          displayValue: action.value,
        },
      }
    }

    case 'setSellInputValue':
      return {
        ...state,
        sellAmount: {
          ...state.sellAmount,
          displayValue: action.value,
        },
      }

    case 'setSellAmountError':
      return {
        ...state,
        sellAmount: {
          ...state.sellAmount,
          error: action.error,
        },
      }

    case 'setBuyAmountError':
      return {
        ...state,
        buyAmount: {
          ...state.buyAmount,
          error: action.error,
        },
      }

    default:
      throw new Error(`touchedReducer invalid action`)
  }
}

const defaultState: SwapFormState = Object.freeze({
  sellAmount: {
    isTouched: true,
    disabled: false,
    error: undefined,
    displayValue: '',
  },
  buyAmount: {
    isTouched: false,
    disabled: false,
    error: undefined,
    displayValue: '',
  },
  selectedPool: {
    isTouched: false,
  },
})
