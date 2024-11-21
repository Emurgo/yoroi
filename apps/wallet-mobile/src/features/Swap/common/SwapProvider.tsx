import {swapManagerMaker, swapStorageMaker} from '@yoroi/swap'
import {BigNumber} from 'bignumber.js'
import {produce} from 'immer'
import React from 'react'
import {Keyboard, TextInput} from 'react-native'

import {useLanguage} from '../../../kernel/i18n'
import {useAddressHex, useFrontendFees, useStakingKey} from '../../../yoroi-wallets/hooks'
import {asQuantity, Quantities} from '../../../yoroi-wallets/utils/utils'
import {usePortfolioBalances} from '../../Portfolio/common/hooks/usePortfolioBalances'
import {usePortfolioPrimaryBalance} from '../../Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {PRICE_PRECISION} from './constants'
import {useStrings} from './strings'

export const useSwap = () => React.useContext(SwapContext)

export const SwapProvider = ({children}: {children: React.ReactNode}) => {
  const {wallet} = useSelectedWallet()
  const network = wallet.networkManager.network
  const balances = usePortfolioBalances({wallet})
  const {aggregatedFrontendFeeTiers = {}} = useFrontendFees(wallet)
  const stakingKey = useStakingKey(wallet)
  const address = wallet.externalAddresses[0]
  const addressHex = useAddressHex(wallet)
  const swapManager = React.useMemo(() => {
    const storage = swapStorageMaker()
    return swapManagerMaker({
      storage,
      aggregatedFrontendFeeTiers,
      network,
      stakingKey,
      address,
      addressHex,
      primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
    })
  }, [aggregatedFrontendFeeTiers, network, stakingKey, address, addressHex, wallet.portfolioPrimaryTokenInfo])

  const {updateAggregatorTokensHeld, aggregatorTokenIds} = swapManager

  React.useEffect(() => {
    updateAggregatorTokensHeld(aggregatorTokenIds.map((id) => balances.records.get(id)).filter((a) => a !== undefined))
  }, [aggregatorTokenIds, balances.records, updateAggregatorTokensHeld])

  const {numberLocale} = useLanguage()
  const strings = useStrings()

  const tokenOutInputRef = React.useRef<TextInput | null>(null)
  const tokenInInputRef = React.useRef<TextInput | null>(null)
  const wantedPriceInputRef = React.useRef<TextInput | null>(null)

  const primaryTokenBalance = usePortfolioPrimaryBalance({wallet}).quantity
  /*
  const hasTokenInBalance = balances.records.get(tokenIn)?.quantity ?? 0n >= tokenInAmount

  const isSellPt = orderData.amounts.sell?.info.id === wallet.portfolioPrimaryTokenInfo.id
  const ptTotalRequired = orderData.selectedPoolCalculation?.cost.ptTotalRequired.quantity ?? 0n
  const hasPtBalance = primaryTokenBalance >= (!isSellPt ? 0n : sellQuantity + ptTotalRequired)
*/
  const [state, dispatch] = React.useReducer(swapReducer, defaultState)

  const context = React.useMemo(
    () => ({
      ...state,
      tokenOutInputRef,
      tokenInInputRef,
      wantedPriceInputRef,
      onChangeSellQuantity,
      onChangeBuyQuantity,
      onChangeLimitPrice,
      ...actions,
    }),
    [state, onChangeSellQuantity, onChangeBuyQuantity, onChangeLimitPrice, actions],
  )

  return <SwapContext.Provider value={context}>{children}</SwapContext.Provider>
}

const swapReducer = (state: SwapState, action: SwapAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case SwapActionType.SellTouched:
        draft.sellQuantity.isTouched = true
        draft.sellQuantity.displayValue = ''
        draft.sellQuantity.error = undefined

        break

      case SwapActionType.BuyTouched:
        draft.buyQuantity.isTouched = true
        draft.buyQuantity.displayValue = ''
        draft.buyQuantity.error = undefined

        break

      case SwapActionType.SwitchTouched:
        draft.sellQuantity.isTouched = state.buyQuantity.isTouched
        draft.buyQuantity.isTouched = state.sellQuantity.isTouched
        draft.sellQuantity.displayValue = state.buyQuantity.displayValue
        draft.buyQuantity.displayValue = state.sellQuantity.displayValue
        draft.sellQuantity.error = undefined
        draft.buyQuantity.error = undefined

        break

      case SwapActionType.PoolTouched:
        draft.selectedPool.isTouched = true

        break

      case SwapActionType.PoolDefaulted:
        draft.selectedPool = defaultState.selectedPool

        break

      case SwapActionType.ResetSwap:
        return defaultState

      case SwapActionType.ResetQuantities:
        return state

      case SwapActionType.CanSwapChanged:
        draft.canSwap = action.canSwap

        break

      case SwapActionType.SellInputValueChanged:
        if (state.sellQuantity.isTouched) draft.sellQuantity.displayValue = action.value

        break

      case SwapActionType.BuyInputValueChanged:
        if (state.buyQuantity.isTouched) draft.buyQuantity.displayValue = action.value

        break

      case SwapActionType.LimitPriceInputValueChanged:
        draft.limitPrice.displayValue = action.value

        break

      case SwapActionType.SellAmountErrorChanged:
        draft.sellQuantity.error = action.error

        break

      case SwapActionType.BuyAmountErrorChanged:
        draft.buyQuantity.error = action.error

        break

      default:
        throw new Error(`swapReducer invalid action`)
    }
  })
}

const defaultState: SwapState = Object.freeze({
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

type SwapState = {
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

type SwapContext = SwapState & {
  tokenInInputRef: React.RefObject<TextInput> | undefined
  tokenOutInputRef: React.RefObject<TextInput> | undefined
  wantedPriceInputRef: React.RefObject<TextInput> | undefined
  onChangeSellQuantity: (text: string) => void
  onChangeBuyQuantity: (text: string) => void
  onChangeLimitPrice: (text: string) => void
}

const SwapContext = React.createContext<SwapContext>(initialExchangeFormContext)
