import {swapManagerMaker, swapStorageMaker} from '@yoroi/swap'
import {produce} from 'immer'
import React from 'react'
import {TextInput} from 'react-native'

import {useAddressHex, useStakingKey} from '../../../yoroi-wallets/hooks'
import {usePortfolioBalances} from '../../Portfolio/common/hooks/usePortfolioBalances'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'

export const useSwap = () => React.useContext(SwapContext)

export const SwapProvider = ({children}: {children: React.ReactNode}) => {
  const {wallet} = useSelectedWallet()
  const network = wallet.networkManager.network
  const _balances = usePortfolioBalances({wallet})
  const stakingKey = useStakingKey(wallet)
  const address = wallet.externalAddresses[0]
  const addressHex = useAddressHex(wallet)
  const swapManager = React.useMemo(() => {
    const storage = swapStorageMaker()
    return swapManagerMaker({
      storage,
      network,
      stakingKey,
      address,
      addressHex,
      primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
    })
  }, [network, stakingKey, address, addressHex, wallet.portfolioPrimaryTokenInfo])

  const tokenOutInputRef = React.useRef<TextInput | null>(null)
  const tokenInInputRef = React.useRef<TextInput | null>(null)
  const wantedPriceInputRef = React.useRef<TextInput | null>(null)
  const slippageInputRef = React.useRef<TextInput | null>(null)

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
      slippageInputRef,
      api: swapManager.api,
      dispatch,
    }),
    [state, swapManager.api],
  )

  return <SwapContext.Provider value={context}>{children}</SwapContext.Provider>
}

const swapReducer = (state: SwapState, action: SwapAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case SwapAction.TokenInInputTouched:
        draft.tokenInInput.isTouched = true
        draft.tokenInInput.displayValue = ''
        draft.tokenInInput.error = undefined

        break
      case SwapAction.TokenOutInputTouched:
        draft.tokenOutInput.isTouched = true
        draft.tokenOutInput.displayValue = ''
        draft.tokenOutInput.error = undefined

        break
      case SwapAction.TokenInIdChanged:
        draft.tokenInInput.displayValue = action.value ?? ''

        break
      case SwapAction.TokenOutIdChanged:
        break
      case SwapAction.TokenInAmountChanged:
        break
      case SwapAction.TokenOutAmountChanged:
        break
      case SwapAction.TokenInErrorChanged:
        break
      case SwapAction.TokenOutErrorChanged:
        break
      case SwapAction.WantedPriceInputChanged:
        break
      case SwapAction.SwitchTouched:
        break
      case SwapAction.DexSelectorTouched:
        break
      case SwapAction.ResetAmounts:
        break
      case SwapAction.ResetForm:
        break
      default:
        throw new Error(`swapReducer invalid action`)
    }
  })
}

export const SwapAction = {
  TokenInInputTouched: 'TokenInInputTouched',
  TokenOutInputTouched: 'TokenOutInputTouched',
  TokenInIdChanged: 'TokenInIdChanged',
  TokenOutIdChanged: 'TokenOutIdChanged',
  TokenInAmountChanged: 'TokenInAmountChanged',
  TokenOutAmountChanged: 'TokenOutAmountChanged',
  TokenInErrorChanged: 'TokenInErrorChanged',
  TokenOutErrorChanged: 'TokenOutErrorChanged',
  WantedPriceInputChanged: 'WantedPriceInputChanged',
  SwitchTouched: 'SwitchTouched',
  DexSelectorTouched: 'DexSelectorTouched',
  ResetAmounts: 'ResetAmounts',
  ResetForm: 'ResetForm',
} as const

export type SwapAction = {
  type: (typeof SwapAction)[keyof typeof SwapAction]
  value?: string
}

const defaultState: SwapState = Object.freeze({
  tokenInInput: {
    isTouched: true,
    disabled: false,
    error: undefined,
    displayValue: '',
  },
  tokenOutInput: {
    isTouched: false,
    disabled: false,
    error: undefined,
    displayValue: '',
  },
  selectedDex: {
    isTouched: false,
  },
  wantedPrice: {
    displayValue: '',
  },
  canSwap: false,
})

type SwapState = {
  tokenInInput: {
    isTouched: boolean
    disabled: boolean
    error: string | undefined
    displayValue: string
  }
  tokenOutInput: {
    isTouched: boolean
    disabled: boolean
    error: string | undefined
    displayValue: string
  }
  selectedDex: {
    isTouched: boolean
  }
  wantedPrice: {
    displayValue: string
  }
  canSwap: boolean
}

type SwapContext = SwapState & {
  tokenInInputRef: React.RefObject<TextInput> | undefined
  tokenOutInputRef: React.RefObject<TextInput> | undefined
  wantedPriceInputRef: React.RefObject<TextInput> | undefined
  slippageInputRef: React.RefObject<TextInput> | undefined
  dispatch: React.Dispatch<SwapAction>
}

const SwapContext = React.createContext<SwapContext>({
  ...defaultState,
  tokenInInputRef: undefined,
  tokenOutInputRef: undefined,
  wantedPriceInputRef: undefined,
  slippageInputRef: undefined,
  dispatch: () => null,
})
