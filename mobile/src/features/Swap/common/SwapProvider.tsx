import {isLeft, isRight, parseNumberFromText} from '@yoroi/common'
import {isPrimaryToken, primaryTokenId} from '@yoroi/portfolio'
import {swapManagerMaker, swapStorageMaker} from '@yoroi/swap'
import {Api, App, Balance, Portfolio, Swap} from '@yoroi/types'

import {useFocusEffect} from '@react-navigation/native'
import {useQuery} from '@tanstack/react-query'
import {produce} from 'immer'
import * as React from 'react'
import {TextInput} from 'react-native'

import {usePortfolioBalances} from '~/features/Portfolio/common/hooks/usePortfolioBalances'
import {usePortfolioTokenInfosSuspense} from '~/features/Portfolio/common/hooks/usePortfolioTokenInfos'
import {useRemoteConfig} from '~/features/RemoteConfig/hooks/useRemoteConfig'
import {useStakingKey} from '~/features/Staking/hooks/useStakingKey'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {convertBech32ToHex} from '~/wallets/cardano/common/signatureUtils'

import {undefinedToken} from './constants'
import {useNavigateTo} from './navigation'
import {useGetInputs} from './useGetInputs'

const SwapActionType = {
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
  ProtocolSelected: 'ProtocolSelected',
  ProtocolChanged: 'ProtocolChanged',
  Refresh: 'Refresh',
  ResetAmounts: 'ResetAmounts',
  ResetForm: 'ResetForm',
  EstimateResponse: 'EstimateResponse',
  EstimateError: 'EstimateError',
  CreateResponse: 'CreateResponse',
  CreateError: 'CreateError',
} as const

type SwapAction =
  | {type: typeof SwapActionType.ChangeOrderType; value: 'limit' | 'market'}
  | {type: typeof SwapActionType.TokenInInputTouched}
  | {type: typeof SwapActionType.TokenOutInputTouched}
  | {type: typeof SwapActionType.TokenInIdChanged; value: Portfolio.Token.Id}
  | {type: typeof SwapActionType.TokenOutIdChanged; value: Portfolio.Token.Id}
  | {type: typeof SwapActionType.TokenInAmountChanged; value: string}
  | {type: typeof SwapActionType.TokenOutAmountChanged; value: string}
  | {type: typeof SwapActionType.TokenInErrorChanged; value: string | null}
  | {type: typeof SwapActionType.TokenOutErrorChanged; value: string | null}
  | {type: typeof SwapActionType.WantedPriceInputChanged; value: string}
  | {type: typeof SwapActionType.SlippageInputChanged; value: number}
  | {type: typeof SwapActionType.SwitchTouched}
  | {type: typeof SwapActionType.ProtocolSelected; value: Swap.Protocol}
  | {
      type: typeof SwapActionType.ProtocolChanged
      value: Swap.Protocol | undefined
    }
  | {type: typeof SwapActionType.Refresh}
  | {type: typeof SwapActionType.ResetAmounts}
  | {type: typeof SwapActionType.ResetForm}
  | {type: typeof SwapActionType.EstimateResponse; value: Swap.EstimateResponse}
  | {type: typeof SwapActionType.EstimateError; value: Api.ResponseError}
  | {type: typeof SwapActionType.CreateResponse; value: Swap.CreateResponse}
  | {type: typeof SwapActionType.CreateError; value: Api.ResponseError}

type SwapState = {
  needsNewEstimate: boolean
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
  selectedProtocol: {
    isTouched: boolean
    value?: Swap.Protocol
  }
  wantedPrice: string
  canSwap: boolean
  estimate?: Swap.EstimateResponse
  createTx?: Swap.CreateResponse
}

export type SwapContext = SwapState & {
  isLoading: boolean
  limitOptions?: Swap.LimitOptionsResponse | null
  tokenInfos: Map<Portfolio.Token.Id, Portfolio.Token.Info>
  verifiedTokens: Portfolio.Token.Id[]
  tokenInInputRef: React.RefObject<TextInput | null> | undefined
  tokenOutInputRef: React.RefObject<TextInput | null> | undefined
  wantedPriceInputRef: React.RefObject<TextInput | null> | undefined
  orders?: Array<Swap.Order>
  action: React.Dispatch<SwapAction>
  create: () => void
  cancel: Swap.Manager['api']['cancel']
  managerSettings: Swap.ManagerSettings
  assignManagerSettings: Swap.Manager['assignSettings']
  refetchOrders: () => void
}

export const SwapProvider = ({children}: React.PropsWithChildren) => {
  const navigate = useNavigateTo()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {getInputs} = useGetInputs()
  const network = wallet.networkManager.network
  const balances = usePortfolioBalances({wallet})
  const stakingKey = useStakingKey(wallet)
  const {config} = useRemoteConfig()
  const [isLoading, setIsLoading] = React.useState(false)

  const swapManager = React.useMemo(() => {
    const address = wallet.externalAddresses[0]
    if (!address) throw new App.Errors.InvalidState('No External Address')

    const addressHex = convertBech32ToHex(address)
    const storage = swapStorageMaker()
    return swapManagerMaker({
      storage,
      network,
      stakingKey,
      address,
      addressHex,
      primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
      isPrimaryToken,
      partners: config?.swap?.partners ?? {},
    })
  }, [
    network,
    stakingKey,
    wallet.externalAddresses,
    wallet.portfolioPrimaryTokenInfo,
    config?.swap?.partners,
  ])

  const {data: orders = [], refetch: refetchOrders} = useQuery({
    queryKey: ['persist', 'useSwapOrders', network, stakingKey],
    queryFn: async () => {
      const res = await swapManager.api.orders()
      if (isRight(res)) return res.value.data
      return []
    },
    enabled: wallet.isMainnet,
  })

  const {data: tokenIds = [], refetch: refetchTokens} = useQuery({
    queryKey: [
      'persist',
      'useSwapTokenIds',
      network,
      swapManager.settings.routingPreference,
    ],
    queryFn: async () => {
      const response = await swapManager.api.tokens()
      if (isRight(response)) {
        const excludedTokens = config?.swap?.excludedTokens ?? []
        const tokenIds = response.value.data
          .map(({id}) => id)
          .filter((id) => excludedTokens.indexOf(id) === -1)
        if (!tokenIds.includes(state.tokenOutInput.tokenId ?? undefinedToken))
          action({type: 'ResetForm'})
        return tokenIds
      }
      return []
    },
    enabled: wallet.isMainnet,
  })

  const refetches = React.useCallback(() => {
    refetchOrders()
    refetchTokens()
  }, [refetchOrders, refetchTokens])

  useFocusEffect(refetches)

  const {tokenInfos: portfolioTokenInfos} = usePortfolioTokenInfosSuspense({
    wallet,
    tokenIds,
    sourceId: 'SwapProvider',
  })

  const tokenInfos = React.useMemo(
    () =>
      portfolioTokenInfos ??
      new Map<Portfolio.Token.Id, Portfolio.Token.Info>(),
    [portfolioTokenInfos],
  )

  const verifiedTokens = React.useMemo(
    () =>
      config?.swap?.verifiedTokens?.filter((ti: Portfolio.Token.Id) =>
        tokenInfos.has(ti),
      ) ?? [],
    [config?.swap?.verifiedTokens, tokenInfos],
  )

  const tokenOutInputRef = React.useRef<TextInput | null>(null)
  const tokenInInputRef = React.useRef<TextInput | null>(null)
  const wantedPriceInputRef = React.useRef<TextInput | null>(null)
  const estimateReqIdRef = React.useRef(0)

  const [state, action] = React.useReducer(swapReducer, defaultState)

  React.useEffect(() => {
    action({type: 'SlippageInputChanged', value: swapManager.settings.slippage})
  }, [swapManager.settings.slippage])

  const {data: limitOptions} = useQuery({
    queryKey: [
      'useSwapLimitOptions',
      network,
      swapManager.settings.routingPreference,
      state.tokenInInput.tokenId,
      state.tokenOutInput.tokenId,
    ],
    queryFn: async () => {
      if (
        state.tokenInInput.tokenId === undefined ||
        state.tokenOutInput.tokenId === undefined
      )
        throw Error()

      const res = await swapManager.api.limitOptions({
        tokenIn: state.tokenInInput.tokenId,
        tokenOut: state.tokenOutInput.tokenId,
      })

      if (isRight(res)) return res.value.data
      return null
    },
    enabled:
      state.orderType === 'limit' &&
      state.tokenInInput.tokenId !== undefined &&
      state.tokenOutInput.tokenId !== undefined &&
      wallet.isMainnet,
  })

  React.useEffect(() => {
    const options = limitOptions?.options ?? []
    const defaultProtocol = limitOptions?.defaultProtocol
    const currentProtocol = state.selectedProtocol.value

    // Determine desired protocol deterministically for limit mode
    let desiredProtocol = currentProtocol

    if (options.length === 1) {
      // If there is exactly one option, always select it
      desiredProtocol = options[0]!.protocol
    } else {
      const currentIsValid = options.some((p) => p.protocol === currentProtocol)
      if (!currentIsValid) {
        desiredProtocol = defaultProtocol ?? options[0]?.protocol
      } else if (
        state.selectedProtocol.isTouched === false &&
        defaultProtocol !== undefined &&
        currentProtocol !== defaultProtocol
      ) {
        // If user hasn't touched yet, prefer defaultProtocol
        desiredProtocol = defaultProtocol
      }
    }

    if (desiredProtocol !== undefined && desiredProtocol !== currentProtocol) {
      action({type: 'ProtocolChanged', value: desiredProtocol})
    }

    const wantedPrice = limitOptions?.wantedPrice
    if (
      state.orderType === 'limit' &&
      wantedPrice !== undefined &&
      wantedPrice > 0 &&
      (options.length === 1 ||
        state.selectedProtocol.value === defaultProtocol ||
        desiredProtocol === defaultProtocol)
    ) {
      action({type: 'WantedPriceInputChanged', value: String(wantedPrice)})
    }
  }, [
    limitOptions?.defaultProtocol,
    limitOptions?.options,
    limitOptions?.wantedPrice,
    state.orderType,
    state.selectedProtocol.isTouched,
    state.selectedProtocol.value,
  ])

  React.useEffect(() => {
    const tokenAmount = balances.records.get(
      state.tokenInInput.tokenId ?? undefinedToken,
    )
    const tokenBalance =
      Number(tokenAmount?.quantity ?? BigInt(0)) /
      10 ** (tokenAmount?.info?.decimals ?? 0)
    const hasEnoughBalance =
      tokenBalance >=
      parseNumberFromText({
        text: state.tokenInInput.value,
      }).numericValue
    if (!hasEnoughBalance) {
      action({
        type: 'TokenInErrorChanged',
        value: strings.swap.notEnoughBalance,
      })
    } else {
      action({type: 'TokenInErrorChanged', value: null})
    }
  }, [
    balances.records,
    state.tokenInInput.tokenId,
    state.tokenInInput.value,
    strings.swap.notEnoughBalance,
  ])

  React.useEffect(() => {
    if (!state.needsNewEstimate) return

    if (
      state.tokenInInput.tokenId === undefined ||
      state.tokenOutInput.tokenId === undefined ||
      (state.tokenInInput.value === '' && state.tokenOutInput.value === '')
    )
      return

    if (!wallet.isMainnet) return

    const reqId = ++estimateReqIdRef.current

    swapManager.api
      .estimate({
        slippage: state.slippageInput.value,
        tokenIn: state.tokenInInput.tokenId,
        tokenOut: state.tokenOutInput.tokenId,
        ...(state.lastInputTouched === 'in'
          ? {
              amountIn: parseNumberFromText({
                text: state.tokenInInput.value,
              }).numericValue,
              ...(state.orderType === 'limit' && {
                wantedPrice: parseNumberFromText({
                  text: state.wantedPrice,
                }).numericValue,
              }),
            }
          : {
              amountOut: parseNumberFromText({
                text: state.tokenOutInput.value,
              }).numericValue,
            }),
        blockedProtocols: [],
        protocol: state.selectedProtocol.value,
      })
      .then((response) => {
        if (reqId !== estimateReqIdRef.current) return
        if (isLeft(response)) {
          action({
            type: SwapActionType.EstimateError,
            value: response.error,
          })
        } else {
          action({
            type: SwapActionType.EstimateResponse,
            value: response.value.data,
          })
        }
      })
      .catch(() => {
        if (reqId !== estimateReqIdRef.current) return
        action({
          type: SwapActionType.EstimateError,
          value: {
            status: -1,
            message: 'Failed to estimate swap. Please try again.',
            responseData: {},
          },
        })
      })
  }, [
    state.needsNewEstimate,
    state.tokenInInput.tokenId,
    state.tokenOutInput.tokenId,
    state.tokenInInput.value,
    state.tokenOutInput.value,
    state.slippageInput.value,
    state.lastInputTouched,
    state.orderType,
    state.wantedPrice,
    state.selectedProtocol.value,
    swapManager.api,
    action,
    wallet.isMainnet,
  ])

  const create = React.useCallback(async () => {
    if (!wallet.isMainnet) return
    if (
      state.tokenInInput.tokenId === undefined ||
      state.tokenOutInput.tokenId === undefined
    )
      return

    setIsLoading(true)

    const tokenInInfo = tokenInfos.get(state.tokenInInput.tokenId)

    const quantityIn =
      parseNumberFromText({
        text: state.tokenInInput.value,
        denomination: tokenInInfo?.decimals ?? 0,
      }).quantity ?? '0'
    const amountsIn: Balance.Amounts = {
      [state.tokenInInput.tokenId]: quantityIn,
    }
    const inputs = await getInputs(amountsIn)

    swapManager.api
      .create({
        tokenIn: state.tokenInInput.tokenId,
        tokenOut: state.tokenOutInput.tokenId,
        amountIn: parseNumberFromText({
          text: state.tokenInInput.value,
        }).numericValue,
        ...(state.orderType === 'limit'
          ? {
              wantedPrice: parseNumberFromText({
                text: state.wantedPrice,
              }).numericValue,
            }
          : {slippage: state.slippageInput.value}),
        blockedProtocols: [],
        protocol: state.selectedProtocol.value,
        inputs,
        routeHint:
          state.estimate?.splits?.[0] != null
            ? {
                aggregator: state.estimate.splits[0].aggregator!,
                aggregatorDexKey: state.estimate.splits[0].aggregatorDexKey,
                poolIds:
                  state.estimate.splits[0].aggregatorPoolId != null
                    ? [state.estimate.splits[0].aggregatorPoolId]
                    : undefined,
                quoteId: state.estimate.splits[0].quoteId,
              }
            : undefined,
      })
      .then((response) => {
        setIsLoading(false)

        if (isLeft(response)) {
          action({type: SwapActionType.CreateError, value: response.error})
        } else {
          action({
            type: SwapActionType.CreateResponse,
            value: response.value.data,
          })
          navigate.reviewSwap()
        }
      })
      .catch(() => {
        setIsLoading(false)
        action({
          type: SwapActionType.CreateError,
          value: {
            status: -1,
            message: 'Failed to create swap. Please try again.',
            responseData: {},
          },
        })
      })
  }, [
    getInputs,
    navigate,
    state.estimate?.splits,
    state.orderType,
    state.selectedProtocol.value,
    state.slippageInput.value,
    state.tokenInInput.tokenId,
    state.tokenInInput.value,
    state.tokenOutInput.tokenId,
    state.wantedPrice,
    swapManager.api,
    tokenInfos,
    wallet.isMainnet,
  ])

  const context = React.useMemo(
    () => ({
      ...state,
      isLoading,
      limitOptions,
      tokenInfos,
      verifiedTokens,
      tokenOutInputRef,
      tokenInInputRef,
      wantedPriceInputRef,
      orders,
      action,
      create,
      cancel: swapManager.api.cancel,
      managerSettings: swapManager.settings,
      assignManagerSettings: swapManager.assignSettings,
      refetchOrders,
      // override canSwap if not on mainnet
      canSwap: wallet.isMainnet ? state.canSwap : false,
    }),
    [
      state,
      isLoading,
      limitOptions,
      tokenInfos,
      verifiedTokens,
      orders,
      create,
      swapManager.api.cancel,
      swapManager.settings,
      swapManager.assignSettings,
      refetchOrders,
      wallet.isMainnet,
    ],
  )

  return (
    <SwapContextInstance.Provider value={context}>
      {children}
    </SwapContextInstance.Provider>
  )
}

export const swapReducer = (state: SwapState, action: SwapAction) => {
  if (action.type === SwapActionType.ResetForm) return defaultState

  return produce(state, (draft) => {
    switch (action.type) {
      case SwapActionType.ChangeOrderType:
        draft.needsNewEstimate = true
        draft.lastInputTouched = 'in'
        draft.orderType = action.value
        break

      case SwapActionType.TokenInInputTouched:
        draft.needsNewEstimate = true
        draft.lastInputTouched = 'in'
        draft.tokenInInput.isTouched = true
        draft.tokenInInput.value = ''
        draft.tokenInInput.error = null
        break

      case SwapActionType.TokenOutInputTouched:
        draft.needsNewEstimate = true
        draft.lastInputTouched = 'in'
        draft.tokenOutInput.isTouched = true
        draft.tokenOutInput.value = ''
        draft.tokenOutInput.error = null
        break

      case SwapActionType.TokenInIdChanged:
        draft.needsNewEstimate = true
        draft.lastInputTouched = 'in'
        draft.tokenInInput.tokenId = action.value
        draft.selectedProtocol.isTouched = false
        draft.wantedPrice = ''
        break

      case SwapActionType.TokenOutIdChanged:
        draft.needsNewEstimate = true
        draft.lastInputTouched = 'in'
        draft.tokenOutInput.tokenId = action.value
        draft.selectedProtocol.isTouched = false
        draft.wantedPrice = ''
        break

      case SwapActionType.TokenInAmountChanged:
        draft.needsNewEstimate = true
        draft.lastInputTouched = 'in'
        draft.tokenInInput.value = parseNumberFromText({
          text: action.value,
        }).sanitizedInput
        if (action.value === '' || action.value === '0') {
          draft.tokenOutInput.value = '0'
          draft.estimate = undefined
          draft.needsNewEstimate = false
        }
        break

      case SwapActionType.TokenOutAmountChanged:
        draft.needsNewEstimate = true
        draft.lastInputTouched = 'out'
        draft.tokenOutInput.value = parseNumberFromText({
          text: action.value,
        }).sanitizedInput
        if (action.value === '' || action.value === '0') {
          draft.tokenInInput.value = '0'
          draft.estimate = undefined
          draft.needsNewEstimate = false
        }
        break

      case SwapActionType.TokenInErrorChanged:
        draft.needsNewEstimate = false
        draft.lastInputTouched = state.lastInputTouched
        draft.tokenInInput.error = action.value
        if (action.value !== null) {
          draft.canSwap = false
        }
        break

      case SwapActionType.TokenOutErrorChanged:
        draft.needsNewEstimate = false
        draft.lastInputTouched = state.lastInputTouched
        draft.tokenOutInput.error = action.value
        if (action.value !== null) {
          draft.canSwap = false
        }
        break

      case SwapActionType.SlippageInputChanged:
        draft.needsNewEstimate = true
        draft.lastInputTouched = 'in'
        draft.slippageInput.value = action.value
        break

      case SwapActionType.WantedPriceInputChanged:
        draft.needsNewEstimate = true
        draft.lastInputTouched = 'in'
        const wantedPrice = parseNumberFromText({
          text: action.value,
        })
        draft.wantedPrice = wantedPrice.sanitizedInput
        if (wantedPrice.numericValue === 0) draft.needsNewEstimate = false
        break

      case SwapActionType.SwitchTouched:
        draft.needsNewEstimate = true
        draft.lastInputTouched = 'in'
        draft.tokenOutInput.isTouched = state.tokenInInput.isTouched
        draft.tokenOutInput.tokenId = state.tokenInInput.tokenId
        draft.tokenOutInput.value = ''
        draft.tokenOutInput.error = null

        draft.tokenInInput.isTouched = state.tokenOutInput.isTouched
        draft.tokenInInput.tokenId = state.tokenOutInput.tokenId
        draft.tokenInInput.value = state.tokenOutInput.value
        draft.tokenInInput.error = null

        draft.wantedPrice = ''
        break

      case SwapActionType.ProtocolSelected:
        draft.needsNewEstimate = true
        draft.lastInputTouched = 'in'
        draft.selectedProtocol.isTouched = true
        draft.selectedProtocol.value = action.value
        break

      case SwapActionType.ProtocolChanged:
        draft.needsNewEstimate = true
        draft.lastInputTouched = 'in'
        draft.selectedProtocol.isTouched = false
        draft.selectedProtocol.value = action.value
        break

      case SwapActionType.Refresh:
        draft.needsNewEstimate = true
        draft.lastInputTouched = state.lastInputTouched
        draft.tokenInInput.error = null
        draft.tokenOutInput.error = null
        draft.canSwap = false
        break

      case SwapActionType.ResetAmounts:
        draft.needsNewEstimate = true
        draft.lastInputTouched = 'in'
        draft.tokenInInput.value = ''
        draft.tokenOutInput.value = ''

        draft.tokenInInput.error = null
        draft.tokenOutInput.error = null
        draft.canSwap = false
        break

      case SwapActionType.EstimateResponse:
        draft.needsNewEstimate = false
        draft.lastInputTouched = state.lastInputTouched
        draft.estimate = action.value
        draft.tokenOutInput.error = null
        // Only enable swap if there are no input errors
        draft.canSwap = state.tokenInInput.error === null

        if (state.lastInputTouched === 'in') {
          draft.tokenOutInput.value = parseNumberFromText({
            text: String(action.value.totalOutputWithoutSlippage ?? 0),
          }).sanitizedInput
        } else {
          draft.tokenInInput.value = parseNumberFromText({
            text: String(action.value.totalInput ?? 0),
          }).sanitizedInput
        }
        break

      case SwapActionType.EstimateError:
        draft.needsNewEstimate = false
        draft.lastInputTouched = 'in'
        draft.estimate = undefined
        draft.tokenOutInput.error = action.value.message
        draft.canSwap = false
        break

      case SwapActionType.CreateResponse:
        draft.needsNewEstimate = false
        draft.lastInputTouched = 'in'
        draft.createTx = action.value
        break

      case SwapActionType.CreateError:
        draft.needsNewEstimate = false
        draft.lastInputTouched = 'in'
        draft.createTx = undefined
        draft.tokenOutInput.error = action.value.message
        draft.canSwap = false
        break
    }
  })
}

export const defaultState: SwapState = Object.freeze({
  needsNewEstimate: false,
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
  selectedProtocol: {
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

const SwapContextInstance = React.createContext<SwapContext>({
  ...defaultState,
  isLoading: false,
  tokenInfos: new Map<Portfolio.Token.Id, Portfolio.Token.Info>(),
  verifiedTokens: [],
  tokenInInputRef: undefined,
  tokenOutInputRef: undefined,
  wantedPriceInputRef: undefined,
  orders: undefined,
  action: () => null,
  create: () => null,
  cancel: () => new Promise((res) => res),
  managerSettings: {routingPreference: 'auto', slippage: 1},
  assignManagerSettings: () => ({routingPreference: 'auto', slippage: 1}),
  refetchOrders: () => null,
})

export {SwapContextInstance}
