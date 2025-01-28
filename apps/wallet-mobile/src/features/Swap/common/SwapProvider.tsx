import {primaryTokenId} from '@yoroi/portfolio'
import {swapManagerMaker, swapStorageMaker} from '@yoroi/swap'
import {Api, Portfolio, Swap} from '@yoroi/types'
import {produce} from 'immer'
import * as React from 'react'
import {TextInput} from 'react-native'
import {useQuery} from 'react-query'

import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {useAddressHex, useStakingKey} from '../../../yoroi-wallets/hooks'
import {usePortfolioBalances} from '../../Portfolio/common/hooks/usePortfolioBalances'
import {usePortfolioTokenInfos} from '../../Portfolio/common/hooks/usePortfolioTokenInfos'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useNavigateTo} from './navigation'
import {useStrings} from './strings'

export const useSwap = () => React.useContext(SwapContext)

export const SwapProvider = ({children}: {children: React.ReactNode}) => {
  const navigate = useNavigateTo()
  const strings = useStrings()
  const {track} = useMetrics()
  const {wallet} = useSelectedWallet()
  const network = wallet.networkManager.network
  const balances = usePortfolioBalances({wallet})
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

  const {data: orders = []} = useQuery(['swapOrders', network, stakingKey, swapManager.config.adapter], async () => {
    const res = await swapManager.api.orders()
    if (res.tag === 'right') return res.value.data
    return []
  })

  const {data: tokenIds = []} = useQuery(['swapTokenIds', network, swapManager.config.adapter], async () => {
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

  const [state, dispatch] = React.useReducer(swapReducer, defaultState)

  const {data: providers = []} = useQuery(
    ['swapProviders', network, swapManager.config.adapter, state.tokenInInput.tokenId, state.tokenOutInput.tokenId],
    async () => {
      if (state.tokenInInput.tokenId === undefined || state.tokenOutInput.tokenId === undefined) throw Error()

      const res = await swapManager.api.providers({
        tokenA: state.tokenInInput.tokenId,
        tokenB: state.tokenOutInput.tokenId,
      })
      if (res.tag === 'right') return res.value.data
      return []
    },
    {enabled: state.tokenInInput.tokenId !== undefined && state.tokenOutInput.tokenId !== undefined},
  )

  React.useEffect(() => {
    const tokenAmount = balances.records.get(state.tokenInInput.tokenId ?? '.unknown')
    const tokenBalance = Number(tokenAmount?.quantity ?? 0n) / 10 ** (tokenAmount?.info?.decimals ?? 0)
    const hasEnoughBalance = tokenBalance >= Number(state.tokenInInput.value)
    if (!hasEnoughBalance) {
      dispatch({type: 'TokenInErrorChanged', value: strings.notEnoughBalance})
    } else {
      dispatch({type: 'TokenInErrorChanged', value: null})
    }
  }, [balances.records, state.tokenInInput.tokenId, state.tokenInInput.value, strings.notEnoughBalance])

  React.useEffect(() => {
    if (state.reqres === 'response') return

    if (
      state.tokenInInput.tokenId === undefined ||
      state.tokenOutInput.tokenId === undefined ||
      (state.tokenInInput.value === '' && state.tokenOutInput.value === '')
    )
      return

    swapManager.api
      .estimate({
        slippage: state.slippageInput.value,
        tokenIn: state.tokenInInput.tokenId,
        tokenOut: state.tokenOutInput.tokenId,
        ...(state.lastInputTouched === 'in'
          ? {
              amountIn: Number(state.tokenInInput.value),
              ...(state.orderType === 'limit' && {wantedPrice: Number(state.wantedPrice)}),
            }
          : {
              amountOut: Number(state.tokenOutInput.value),
            }),
        blacklistedDexes: [],
        dex: state.selectedDex.value,
      })
      .then((response) => {
        if (response.tag === 'left') {
          dispatch({type: SwapAction.EstimateError, value: response.error})
        } else {
          dispatch({type: SwapAction.EstimateResponse, value: response.value.data})
        }
      })
  }, [state, swapManager.api])

  const create = React.useCallback(() => {
    if (state.tokenInInput.tokenId === undefined || state.tokenOutInput.tokenId === undefined) return

    const tokenInInfo = tokenInfos.get(state.tokenInInput.tokenId)
    const tokenOutInfo = tokenInfos.get(state.tokenOutInput.tokenId)

    track.swapOrderSelected({
      from_asset: [
        {
          asset_name: tokenInInfo?.name,
          asset_ticker: tokenInInfo?.ticker,
          policy_id: tokenInInfo?.id.split('.')[0],
        },
      ],
      to_asset: [
        {asset_name: tokenOutInfo?.name, asset_ticker: tokenOutInfo?.ticker, policy_id: tokenOutInfo?.id.split('.')[0]},
      ],
      order_type: state.orderType,
      slippage_tolerance: state.slippageInput.value,
      from_amount: state.tokenInInput.value,
      to_amount: state.tokenOutInput.value,
      pool_source: state.estimate?.splits[0].poolId ?? '',
      swap_fees: state.estimate?.totalFee,
    })

    swapManager.api
      .create({
        tokenIn: state.tokenInInput.tokenId,
        tokenOut: state.tokenOutInput.tokenId,
        amountIn: Number(state.tokenInInput.value),
        ...(state.orderType === 'limit'
          ? {wantedPrice: Number(state.wantedPrice)}
          : {slippage: state.slippageInput.value}),
        blacklistedDexes: [],
        dex: state.selectedDex.value,
      })
      .then((response) => {
        if (response.tag === 'left') {
          dispatch({type: SwapAction.CreateError, value: response.error})
        } else {
          dispatch({type: SwapAction.CreateResponse, value: response.value.data})
          navigate.reviewSwap()
        }
      })
  }, [
    navigate,
    state.estimate?.splits,
    state.estimate?.totalFee,
    state.orderType,
    state.selectedDex.value,
    state.slippageInput.value,
    state.tokenInInput.tokenId,
    state.tokenInInput.value,
    state.tokenOutInput.tokenId,
    state.tokenOutInput.value,
    state.wantedPrice,
    swapManager.api,
    tokenInfos,
    track,
  ])

  const context = React.useMemo(
    () => ({
      ...state,
      providers,
      tokenInfos,
      tokenOutInputRef,
      tokenInInputRef,
      wantedPriceInputRef,
      slippageInputRef,
      orders,
      dispatch,
      create,
      cancel: swapManager.api.cancel,
      managerConfig: swapManager.config,
      assignManagerConfig: swapManager.assignConfig,
    }),
    [
      state,
      providers,
      tokenInfos,
      orders,
      create,
      swapManager.api.cancel,
      swapManager.config,
      swapManager.assignConfig,
    ],
  )

  return <SwapContext.Provider value={context}>{children}</SwapContext.Provider>
}

const swapReducer = (state: SwapState, action: SwapAction) => {
  return produce(state, (draft) => {
    draft.reqres = 'request'
    draft.lastInputTouched = 'in'

    switch (action.type) {
      case SwapAction.ChangeOrderType:
        draft.orderType = action.value
        break
      case SwapAction.TokenInInputTouched:
        draft.tokenInInput.isTouched = true
        draft.tokenInInput.value = ''
        draft.tokenInInput.error = null

        break
      case SwapAction.TokenOutInputTouched:
        draft.tokenOutInput.isTouched = true
        draft.tokenOutInput.value = ''
        draft.tokenOutInput.error = null

        break
      case SwapAction.TokenInIdChanged:
        draft.tokenInInput.tokenId = action.value
        draft.selectedDex.isTouched = false

        break
      case SwapAction.TokenOutIdChanged:
        draft.tokenOutInput.tokenId = action.value
        draft.selectedDex.isTouched = false

        break
      case SwapAction.TokenInAmountChanged:
        try {
          draft.tokenInInput.value = String(Number(action.value))
        } catch {
          break
        }
        if (action.value === '' || action.value === '0') draft.tokenOutInput.value = '0'

        break
      case SwapAction.TokenOutAmountChanged:
        try {
          draft.lastInputTouched = 'out'
          draft.tokenOutInput.value = String(Number(action.value))
        } catch {
          break
        }
        if (action.value === '' || action.value === '0') draft.tokenInInput.value = '0'

        break
      case SwapAction.TokenInErrorChanged:
        draft.lastInputTouched = state.lastInputTouched
        draft.tokenInInput.error = action.value
        draft.reqres = 'response'

        break
      case SwapAction.TokenOutErrorChanged:
        draft.lastInputTouched = state.lastInputTouched
        draft.tokenOutInput.error = action.value
        draft.reqres = 'response'

        break
      case SwapAction.SlippageInputChanged:
        draft.slippageInput.value = action.value

        break
      case SwapAction.WantedPriceInputChanged:
        try {
          draft.wantedPrice = String(Number(action.value))
        } catch {
          break
        }

        break
      case SwapAction.SwitchTouched:
        draft.tokenOutInput.isTouched = state.tokenInInput.isTouched
        draft.tokenOutInput.tokenId = state.tokenInInput.tokenId
        draft.tokenOutInput.value = ''
        draft.tokenOutInput.error = null

        draft.tokenInInput.isTouched = state.tokenOutInput.isTouched
        draft.tokenInInput.tokenId = state.tokenOutInput.tokenId
        draft.tokenInInput.value = ''
        draft.tokenInInput.error = null

        break
      case SwapAction.DexSelectorTouched:
        draft.selectedDex.isTouched = true
        draft.selectedDex.value = action.value

        break
      case SwapAction.Refresh:
        draft.lastInputTouched = state.lastInputTouched
        draft.tokenInInput.error = null
        draft.tokenOutInput.error = null

        break
      case SwapAction.ResetAmounts:
        draft.tokenInInput.value = ''
        draft.tokenOutInput.value = ''

        draft.tokenInInput.error = null
        draft.tokenOutInput.error = null

        break
      case SwapAction.ResetForm:
        draft = defaultState
        break
      case SwapAction.EstimateResponse:
        draft.lastInputTouched = state.lastInputTouched
        draft.reqres = 'response'
        draft.estimate = action.value
        draft.tokenOutInput.error = null
        draft.canSwap = true
        draft.wantedPrice = state.wantedPrice === '' ? String(action.value.netPrice) : state.wantedPrice
        if (state.lastInputTouched === 'in') {
          draft.tokenOutInput.value = String(action.value.totalOutputWithoutSlippage ?? 0)
        } else {
          draft.tokenInInput.value = String(action.value.totalInput ?? 0)
        }

        break
      case SwapAction.EstimateError:
        draft.estimate = undefined
        draft.tokenOutInput.error = action.value.message
        draft.canSwap = false

        break
      case SwapAction.CreateResponse:
        draft.createTx = action.value

        break
      case SwapAction.CreateError:
        draft.createTx = undefined
        draft.tokenOutInput.error = action.value.message

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
  Refresh: 'Refresh',
  ResetAmounts: 'ResetAmounts',
  ResetForm: 'ResetForm',
  EstimateResponse: 'EstimateResponse',
  EstimateError: 'EstimateError',
  CreateResponse: 'CreateResponse',
  CreateError: 'CreateError',
} as const

type SwapActionValueMap = {
  ChangeOrderType: 'limit' | 'market'
  TokenInInputTouched: undefined
  TokenOutInputTouched: undefined
  TokenInIdChanged: Portfolio.Token.Id
  TokenOutIdChanged: Portfolio.Token.Id
  TokenInAmountChanged: string
  TokenOutAmountChanged: string
  TokenInErrorChanged: string | null
  TokenOutErrorChanged: string | null
  WantedPriceInputChanged: string
  SlippageInputChanged: number
  SwitchTouched: undefined
  DexSelectorTouched: Swap.Provider
  Refresh: undefined
  ResetAmounts: undefined
  ResetForm: undefined
  EstimateResponse: Swap.EstimateResponse
  EstimateError: Api.ResponseError
  CreateResponse: Swap.CreateResponse
  CreateError: Api.ResponseError
}

export type SwapAction = {
  [K in keyof SwapActionValueMap]: SwapActionValueMap[K] extends undefined
    ? {type: K}
    : {type: K; value: SwapActionValueMap[K]}
}[keyof SwapActionValueMap]

const defaultState: SwapState = Object.freeze({
  reqres: 'response',
  orderType: 'market',
  lastInputTouched: 'in',
  tokenInInput: {
    isTouched: true,
    tokenId: primaryTokenId,
    disabled: false,
    error: null,
    value: '',
  },
  tokenOutInput: {
    isTouched: false,
    tokenId: undefined,
    disabled: false,
    error: null,
    value: '',
  },
  slippageInput: {
    value: 1,
  },
  selectedDex: {
    isTouched: false,
    value: undefined,
  },
  wantedPrice: '',
  canSwap: false,
  estimate: undefined,
  createTx: undefined,
  cancelTx: undefined,
  cancelError: undefined,
} as const)

type SwapState = {
  reqres: 'request' | 'response'
  orderType: 'market' | 'limit'
  lastInputTouched: 'in' | 'out'
  tokenInInput: {
    isTouched: boolean
    tokenId?: Portfolio.Token.Id
    disabled: boolean
    error: string | null
    value: string
  }
  tokenOutInput: {
    isTouched: boolean
    tokenId?: Portfolio.Token.Id
    disabled: boolean
    error: string | null
    value: string
  }
  slippageInput: {
    value: number
  }
  selectedDex: {
    isTouched: boolean
    value?: Swap.Provider
  }
  wantedPrice: string
  canSwap: boolean
  estimate?: Swap.EstimateResponse
  createTx?: Swap.CreateResponse
}

export type SwapContext = SwapState & {
  providers: Swap.ProvidersResponse
  tokenInfos: Map<Portfolio.Token.Id, Portfolio.Token.Info>
  tokenInInputRef: React.RefObject<TextInput> | undefined
  tokenOutInputRef: React.RefObject<TextInput> | undefined
  wantedPriceInputRef: React.RefObject<TextInput> | undefined
  slippageInputRef: React.RefObject<TextInput> | undefined
  orders?: Array<Swap.Order>
  dispatch: React.Dispatch<SwapAction>
  create: () => void
  cancel: Swap.Api['cancel']
  managerConfig: Swap.ManagerConfig
  assignManagerConfig: Swap.Manager['assignConfig']
}

const SwapContext = React.createContext<SwapContext>({
  ...defaultState,
  providers: [],
  tokenInfos: new Map<Portfolio.Token.Id, Portfolio.Token.Info>(),
  tokenInInputRef: undefined,
  tokenOutInputRef: undefined,
  wantedPriceInputRef: undefined,
  slippageInputRef: undefined,
  orders: undefined,
  dispatch: () => null,
  create: () => null,
  cancel: () => new Promise((res) => res),
  managerConfig: {adapter: 'auto'},
  assignManagerConfig: () => ({adapter: 'auto'}),
})
