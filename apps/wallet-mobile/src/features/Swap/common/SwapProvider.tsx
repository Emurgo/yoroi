import {primaryTokenId} from '@yoroi/portfolio'
import {swapManagerMaker, swapStorageMaker} from '@yoroi/swap'
import {Portfolio, Swap} from '@yoroi/types'
import {produce} from 'immer'
import React from 'react'
import {TextInput} from 'react-native'
import {useQuery} from 'react-query'

import {useAddressHex, useStakingKey} from '../../../yoroi-wallets/hooks'
import {usePortfolioBalances} from '../../Portfolio/common/hooks/usePortfolioBalances'
import {usePortfolioTokenInfos} from '../../Portfolio/common/hooks/usePortfolioTokenInfos'
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

  const {data: orders = []} = useQuery([network, stakingKey], async () => {
    const res = await swapManager.api.orders()
    if (res.tag === 'right') return res.value.data
    return []
  })

  const {data: tokenIds = []} = useQuery([network], async () => {
    const res = await swapManager.api.tokens()
    if (res.tag === 'right') return res.value.data.map(({id}) => id)
    return []
  })

  const {tokenInfos = new Map<`${string}.${string}`, Portfolio.Token.Info>()} = usePortfolioTokenInfos(
    {wallet, tokenIds},
    {suspense: true},
  )

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
      tokenInfos,
      tokenOutInputRef,
      tokenInInputRef,
      wantedPriceInputRef,
      slippageInputRef,
      api: swapManager.api,
      orders,
      dispatch,
    }),
    [state, swapManager.api, orders, tokenInfos],
  )

  return <SwapContext.Provider value={context}>{children}</SwapContext.Provider>
}

const swapReducer = (state: SwapState, action: SwapAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case SwapAction.ChangeOrderType:
        draft.orderType = action.value
        break
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
        draft.tokenInInput.tokenId = action.value

        break
      case SwapAction.TokenOutIdChanged:
        draft.tokenInInput.tokenId = action.value

        break
      case SwapAction.TokenInAmountChanged:
        draft.tokenInInput.displayValue = action.value

        break
      case SwapAction.TokenOutAmountChanged:
        draft.tokenOutInput.displayValue = action.value

        break
      case SwapAction.TokenInErrorChanged:
        draft.tokenInInput.error = action.value

        break
      case SwapAction.TokenOutErrorChanged:
        draft.tokenOutInput.error = action.value

        break
      case SwapAction.SlippageInputChanged:
        draft.slippageInput.displayValue = String(action.value)

        break
      case SwapAction.WantedPriceInputChanged:
        draft.wantedPrice.displayValue = action.value

        break
      case SwapAction.SwitchTouched:
        draft.tokenOutInput.isTouched = state.tokenInInput.isTouched
        draft.tokenOutInput.tokenId = state.tokenInInput.tokenId
        draft.tokenOutInput.displayValue = ''
        draft.tokenOutInput.error = undefined

        draft.tokenInInput.isTouched = state.tokenOutInput.isTouched
        draft.tokenInInput.tokenId = state.tokenOutInput.tokenId
        draft.tokenInInput.displayValue = ''
        draft.tokenInInput.error = undefined

        break
      case SwapAction.DexSelectorTouched:
        break
      case SwapAction.ResetAmounts:
        draft.tokenInInput.displayValue = ''
        draft.tokenOutInput.displayValue = ''

        draft.tokenInInput.error = undefined
        draft.tokenOutInput.error = undefined

        break
      case SwapAction.ResetForm:
        draft = defaultState
        break
      default:
        throw new Error(`swapReducer invalid action`)
    }
  })
}

export const SwapAction = {
  ChangeOrderType: 'ChangeOrderType',
  TokenInInputTouched: 'TokenInInputTouched',
  TokenOutInputTouched: 'TokenOutInputTouched',
  TokenInIdChanged: 'TokenInIdChanged',
  TokenOutIdChanged: 'TokenOutIdChanged',
  TokenInAmountChanged: 'TokenInAmountChanged',
  TokenOutAmountChanged: 'TokenOutAmountChanged',
  TokenInErrorChanged: 'TokenInErrorChanged',
  TokenOutErrorChanged: 'TokenOutErrorChanged',
  WantedPriceInputChanged: 'WantedPriceInputChanged',
  SlippageInputChanged: 'SlippageInputChanged',
  SwitchTouched: 'SwitchTouched',
  DexSelectorTouched: 'DexSelectorTouched',
  ResetAmounts: 'ResetAmounts',
  ResetForm: 'ResetForm',
} as const

type SwapActionValueMap = {
  ChangeOrderType: 'limit' | 'market'
  TokenInInputTouched: undefined
  TokenOutInputTouched: undefined
  TokenInIdChanged: Portfolio.Token.Id
  TokenOutIdChanged: Portfolio.Token.Id
  TokenInAmountChanged: string
  TokenOutAmountChanged: string
  TokenInErrorChanged: string
  TokenOutErrorChanged: string
  WantedPriceInputChanged: string
  SlippageInputChanged: number
  SwitchTouched: undefined
  DexSelectorTouched: undefined
  ResetAmounts: undefined
  ResetForm: undefined
}

export type SwapAction = {
  [K in keyof SwapActionValueMap]: SwapActionValueMap[K] extends undefined
    ? {type: K}
    : {type: K; value: SwapActionValueMap[K]}
}[keyof SwapActionValueMap]

const defaultState: SwapState = Object.freeze({
  orderType: 'market',
  tokenInInput: {
    isTouched: true,
    tokenId: primaryTokenId,
    disabled: false,
    error: undefined,
    displayValue: '',
  },
  tokenOutInput: {
    isTouched: false,
    tokenId: undefined,
    disabled: false,
    error: undefined,
    displayValue: '',
  },
  slippageInput: {
    displayValue: '1',
  },
  selectedDex: {
    isTouched: false,
  },
  wantedPrice: {
    displayValue: '',
  },
  canSwap: false,
  estimate: undefined,
} as const)

type SwapState = {
  orderType: 'market' | 'limit'
  tokenInInput: {
    isTouched: boolean
    tokenId?: Portfolio.Token.Id
    disabled: boolean
    error: string | undefined
    displayValue: string
  }
  tokenOutInput: {
    isTouched: boolean
    tokenId?: Portfolio.Token.Id
    disabled: boolean
    error: string | undefined
    displayValue: string
  }
  slippageInput: {
    displayValue: string
  }
  selectedDex: {
    isTouched: boolean
  }
  wantedPrice: {
    displayValue: string
  }
  canSwap: boolean
  estimate?: Swap.EstimateResponse
}

type SwapContext = SwapState & {
  tokenInfos: Map<`${string}.${string}`, Portfolio.Token.Info>
  tokenInInputRef: React.RefObject<TextInput> | undefined
  tokenOutInputRef: React.RefObject<TextInput> | undefined
  wantedPriceInputRef: React.RefObject<TextInput> | undefined
  slippageInputRef: React.RefObject<TextInput> | undefined
  orders?: Array<Swap.Order>
  dispatch: React.Dispatch<SwapAction>
}

const SwapContext = React.createContext<SwapContext>({
  ...defaultState,
  tokenInfos: new Map<`${string}.${string}`, Portfolio.Token.Info>(),
  tokenInInputRef: undefined,
  tokenOutInputRef: undefined,
  wantedPriceInputRef: undefined,
  slippageInputRef: undefined,
  orders: undefined,
  dispatch: () => null,
})
