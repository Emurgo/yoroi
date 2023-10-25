import {App, Balance, Swap} from '@yoroi/types'
import {produce} from 'immer'

import {Quantities} from '../../../utils/quantities'
import {makeOrderCalculations} from '../../../helpers/orders/factories/makeOrderCalculations'
import {selectedPoolCalculationSelector} from './selectors/selectedPoolCalculationSelector'
import {getBestPoolCalculation} from '../../../helpers/pools/getBestPoolCalculation'

export type SimpleTokenInfo = {
  id: Balance.TokenInfo['id']
  decimals: Exclude<Balance.TokenInfo['decimals'], undefined>
}

export type SwapOrderCalculation = Readonly<{
  order: {
    side?: 'buy' | 'sell'
    slippage: number
    orderType: Swap.OrderType
    limitPrice?: Balance.Quantity
    amounts: {
      sell: Balance.Amount
      buy: Balance.Amount
    }
    lpTokenHeld?: Balance.Amount
  }
  sides: {
    sell: Balance.Amount
    buy: Balance.Amount
  }
  pool: Swap.Pool
  prices: {
    base: Balance.Quantity
    market: Balance.Quantity
    withSlippage: Balance.Quantity
    withFees: Balance.Quantity
    withFeesAndSlippage: Balance.Quantity
    difference: Balance.Quantity
  }
  hasSupply: boolean
  buyAmountWithSlippage: Balance.Amount
  cost: {
    liquidityFee: Balance.Amount
    deposit: Balance.Amount
    batcherFee: Balance.Amount
    frontendFeeInfo: {
      discountTier?: App.FrontendFeeTier
      fee: Balance.Amount
    }
    ptTotalRequired: Balance.Amount
  }
}>

export type SwapState = Readonly<{
  orderData: {
    // user inputs
    amounts: {
      sell: Balance.Amount
      buy: Balance.Amount
    }
    type: Swap.OrderType
    limitPrice?: Balance.Quantity
    slippage: number
    // when limit can manually select a pool
    selectedPoolId?: string
    selectedPoolCalculation?: SwapOrderCalculation

    // state from wallet
    lpTokenHeld?: Balance.Amount
    tokens: {
      sellInfo: SimpleTokenInfo
      buyInfo: SimpleTokenInfo
      ptInfo: SimpleTokenInfo
      // diff sell - buy decimals
      priceDenomination: number
    }
    frontendFeeTiers: ReadonlyArray<App.FrontendFeeTier>

    // state from swap api
    pools: ReadonlyArray<Swap.Pool>

    // derivaded data
    calculations: ReadonlyArray<SwapOrderCalculation>
    bestPoolCalculation?: SwapOrderCalculation
  }
  unsignedTx: any
}>

export type SwapCreateOrderActions = Readonly<{
  orderTypeChanged: (orderType: Swap.OrderType) => void
  selectedPoolChanged: (poolId: string) => void
  slippageChanged: (slippage: number) => void
  switchTokens: () => void
  resetQuantities: () => void
  limitPriceChanged: (limitPrice: Balance.Quantity) => void
  sellQuantityChanged: (quantity: Balance.Quantity) => void
  buyQuantityChanged: (quantity: Balance.Quantity) => void
  sellTokenInfoChanged: (tokenInfo: SimpleTokenInfo) => void
  buyTokenInfoChanged: (tokenInfo: SimpleTokenInfo) => void
  poolPairsChanged: (pools: ReadonlyArray<Swap.Pool>) => void
  lpTokenHeldChanged: (amount: Balance.Amount | undefined) => void
  primaryTokenInfoChanged: (tokenInfo: SimpleTokenInfo) => void
  frontendFeeTiersChanged: (
    feeTiers: ReadonlyArray<App.FrontendFeeTier>,
  ) => void
}>

export enum SwapCreateOrderActionType {
  OrderTypeChanged = 'orderTypeChanged',
  SelectedPoolChanged = 'selectedPoolChanged',
  SlippageChanged = 'slippageChanged',
  TxPayloadChanged = 'txPayloadChanged',
  SwitchTokens = 'switchTokens',
  ResetQuantities = 'resetQuantities',
  LimitPriceChanged = 'limitPriceChanged',
  SellQuantityChanged = 'sellQuantityChanged',
  BuyQuantityChanged = 'buyQuantityChanged',
  SellTokenInfoChanged = 'sellTokenInfoChanged',
  BuyTokenInfoChanged = 'buyTokenInfoChanged',
  PoolPairsChanged = 'poolPairsChanged',
  LpTokenHeldChanged = 'lpTokenHeldChanged',
  PrimaryTokenInfoChanged = 'primaryTokenInfoChanged',
  FrontendFeeTiersChanged = 'frontendFeeTiersChanged',
}

export type SwapCreateOrderAction =
  | {
      type: SwapCreateOrderActionType.OrderTypeChanged
      orderType: Swap.OrderType
    }
  | {
      type: SwapCreateOrderActionType.SelectedPoolChanged
      poolId: string
    }
  | {
      type: SwapCreateOrderActionType.SlippageChanged
      slippage: number
    }
  | {
      type: SwapCreateOrderActionType.LimitPriceChanged
      limitPrice: Balance.Quantity
    }
  | {type: SwapCreateOrderActionType.SwitchTokens}
  | {type: SwapCreateOrderActionType.ResetQuantities}
  | {
      type: SwapCreateOrderActionType.SellQuantityChanged
      quantity: Balance.Quantity
    }
  | {
      type: SwapCreateOrderActionType.BuyQuantityChanged
      quantity: Balance.Quantity
    }
  | {
      type: SwapCreateOrderActionType.SellTokenInfoChanged
      tokenInfo: SimpleTokenInfo
    }
  | {
      type: SwapCreateOrderActionType.BuyTokenInfoChanged
      tokenInfo: SimpleTokenInfo
    }
  | {
      type: SwapCreateOrderActionType.PoolPairsChanged
      pools: ReadonlyArray<Swap.Pool>
    }
  | {
      type: SwapCreateOrderActionType.LpTokenHeldChanged
      amount: Balance.Amount | undefined
    }
  | {
      type: SwapCreateOrderActionType.PrimaryTokenInfoChanged
      tokenInfo: SimpleTokenInfo
    }
  | {
      type: SwapCreateOrderActionType.FrontendFeeTiersChanged
      feeTiers: ReadonlyArray<App.FrontendFeeTier>
    }

export type SwapActions = Readonly<{
  // TODO: import from @yoroi/common unsignedTx type
  unsignedTxChanged: (
    unsignedTx: Readonly<Record<string, unknown>> | undefined,
  ) => void
  resetState: () => void
}>

export enum SwapActionType {
  UnsignedTxChanged = 'unsignedTxChanged',
  ResetState = 'resetState',
}

export type SwapAction =
  | {
      type: SwapActionType.UnsignedTxChanged
      unsignedTx: Readonly<Record<string, unknown>> | undefined
    }
  | {type: SwapActionType.ResetState}

export const combinedSwapReducers = (
  state: SwapState,
  action: SwapCreateOrderAction | SwapAction,
) => {
  return {
    ...swapReducer(
      {
        ...state,
        ...orderReducer(state, action as SwapCreateOrderAction),
      },
      action as SwapAction,
    ),
  } as const
}

export const defaultSwapState: SwapState = {
  orderData: {
    // user inputs
    type: 'market',
    amounts: {
      sell: {
        quantity: Quantities.zero,
        tokenId: '',
      },
      buy: {
        quantity: Quantities.zero,
        tokenId: '',
      },
    },
    slippage: 1,
    limitPrice: undefined,
    // when limit can manually select a pool
    selectedPoolId: undefined,
    selectedPoolCalculation: undefined,

    // state from wallet
    lpTokenHeld: undefined,
    tokens: {
      sellInfo: {
        decimals: 0,
        id: '',
      },
      buyInfo: {
        decimals: 0,
        id: '',
      },
      ptInfo: {
        decimals: 0,
        id: '',
      },
      priceDenomination: 0,
    },
    frontendFeeTiers: [] as const,

    // state from api
    pools: [] as const,

    // derivaded data
    calculations: [] as const,
    bestPoolCalculation: undefined,
  },
  unsignedTx: undefined,
} as const

const defaultSwapCreateOrderActions: SwapCreateOrderActions = {
  orderTypeChanged: missingInit,
  selectedPoolChanged: missingInit,
  slippageChanged: missingInit,
  switchTokens: missingInit,
  resetQuantities: missingInit,
  limitPriceChanged: missingInit,
  sellQuantityChanged: missingInit,
  buyQuantityChanged: missingInit,
  sellTokenInfoChanged: missingInit,
  buyTokenInfoChanged: missingInit,
  poolPairsChanged: missingInit,
  lpTokenHeldChanged: missingInit,
  primaryTokenInfoChanged: missingInit,
  frontendFeeTiersChanged: missingInit,
} as const

const defaultStateActions: SwapActions = {
  unsignedTxChanged: missingInit,
  resetState: missingInit,
} as const

export const defaultSwapActions = {
  ...defaultSwapCreateOrderActions,
  ...defaultStateActions,
} as const

const orderReducer = (
  state: Readonly<SwapState>,
  action: Readonly<SwapCreateOrderAction>,
) => {
  return produce(state, (draft) => {
    switch (action.type) {
      // when changing order type, from market to limit
      // or when is the first calculation as limit with data
      // the limit price is set to the best market price
      case SwapCreateOrderActionType.OrderTypeChanged:
        draft.orderData.type = action.orderType

        draft.orderData.calculations = makeOrderCalculations({
          orderType: action.orderType,
          amounts: state.orderData.amounts,
          limitPrice: state.orderData.limitPrice,
          slippage: state.orderData.slippage,
          pools: state.orderData.pools,
          tokens: state.orderData.tokens,
          lpTokenHeld: state.orderData.lpTokenHeld,
          side: 'sell',
          frontendFeeTiers: state.orderData.frontendFeeTiers,
        })
        draft.orderData.bestPoolCalculation = getBestPoolCalculation(
          draft.orderData.calculations,
        )
        draft.orderData.selectedPoolCalculation =
          selectedPoolCalculationSelector(draft.orderData)

        if (draft.orderData.selectedPoolCalculation === undefined) break

        draft.orderData.amounts.buy =
          draft.orderData.selectedPoolCalculation.sides.buy

        if (
          draft.orderData.type === 'limit' &&
          state.orderData.limitPrice === undefined
        )
          draft.orderData.limitPrice =
            draft.orderData.bestPoolCalculation?.prices.market

        break

      // when changing pool, the selection comes from the calculations
      // so it updates the buy side only
      // it ignores events if order type is not limit
      // NOTE: late it can replace the order from market to limit and recalc
      case SwapCreateOrderActionType.SelectedPoolChanged:
        if (state.orderData.type === 'market') break

        draft.orderData.selectedPoolId = action.poolId

        draft.orderData.selectedPoolCalculation =
          selectedPoolCalculationSelector(draft.orderData)

        if (draft.orderData.selectedPoolCalculation === undefined) break

        draft.orderData.amounts.buy =
          draft.orderData.selectedPoolCalculation.sides.buy

        draft.orderData.limitPrice =
          draft.orderData.selectedPoolCalculation.prices.market
        break

      case SwapCreateOrderActionType.SlippageChanged:
        draft.orderData.slippage = action.slippage

        draft.orderData.calculations = makeOrderCalculations({
          orderType: state.orderData.type,
          amounts: state.orderData.amounts,
          limitPrice: state.orderData.limitPrice,
          slippage: action.slippage,
          pools: state.orderData.pools,
          tokens: state.orderData.tokens,
          lpTokenHeld: state.orderData.lpTokenHeld,
          frontendFeeTiers: state.orderData.frontendFeeTiers,
          side: 'sell',
        })

        draft.orderData.bestPoolCalculation = getBestPoolCalculation(
          draft.orderData.calculations,
        )
        draft.orderData.selectedPoolCalculation =
          selectedPoolCalculationSelector(draft.orderData)
        break

      // when switching and the type is limit can end up with weird amounts
      // yet, we updated buy/sell based on the current selected pool if limit
      case SwapCreateOrderActionType.SwitchTokens:
        draft.orderData.amounts = {
          sell: state.orderData.amounts.buy,
          buy: state.orderData.amounts.sell,
        }
        draft.orderData.tokens = {
          sellInfo: state.orderData.tokens.buyInfo,
          buyInfo: state.orderData.tokens.sellInfo,
          priceDenomination: -state.orderData.tokens.priceDenomination,
          ptInfo: state.orderData.tokens.ptInfo,
        }

        draft.orderData.calculations = makeOrderCalculations({
          orderType: state.orderData.type,
          amounts: draft.orderData.amounts,
          limitPrice: state.orderData.limitPrice,
          slippage: state.orderData.slippage,
          pools: state.orderData.pools,
          tokens: draft.orderData.tokens,
          lpTokenHeld: state.orderData.lpTokenHeld,
          frontendFeeTiers: state.orderData.frontendFeeTiers,
          side: 'sell',
        })

        draft.orderData.bestPoolCalculation = getBestPoolCalculation(
          draft.orderData.calculations,
        )
        draft.orderData.selectedPoolCalculation =
          selectedPoolCalculationSelector(draft.orderData)

        if (draft.orderData.selectedPoolCalculation === undefined) break

        draft.orderData.amounts.buy =
          draft.orderData.selectedPoolCalculation.sides.buy
        break

      // when resetting quantities, when order is limit, limit price is the best market price
      // also resets the selected pool, otherwise users will need to leave the funnel
      // otherwise the limit set back to undefined
      case SwapCreateOrderActionType.ResetQuantities:
        draft.orderData.amounts = {
          sell: {
            quantity: Quantities.zero,
            tokenId: state.orderData.amounts.sell.tokenId,
          },
          buy: {
            quantity: Quantities.zero,
            tokenId: state.orderData.amounts.buy.tokenId,
          },
        }
        draft.orderData.selectedPoolId = undefined
        draft.orderData.limitPrice = undefined

        draft.orderData.calculations = makeOrderCalculations({
          orderType: 'market',
          amounts: draft.orderData.amounts,
          limitPrice: undefined,
          slippage: state.orderData.slippage,
          pools: state.orderData.pools,
          tokens: state.orderData.tokens,
          lpTokenHeld: state.orderData.lpTokenHeld,
          frontendFeeTiers: state.orderData.frontendFeeTiers,
        })

        draft.orderData.bestPoolCalculation = getBestPoolCalculation(
          draft.orderData.calculations,
        )
        draft.orderData.selectedPoolCalculation =
          selectedPoolCalculationSelector(draft.orderData)

        draft.orderData.limitPrice =
          state.orderData.type === 'limit'
            ? draft.orderData.bestPoolCalculation?.prices.market
            : undefined
        break

      // when limit price changes, the best pool is recalculated
      // yet if there is a selected pool it will not change
      // this can cause a pool if not enough supply to be selected
      // must be handled on the UI
      case SwapCreateOrderActionType.LimitPriceChanged:
        if (state.orderData.type === 'market') break

        draft.orderData.limitPrice = action.limitPrice

        draft.orderData.calculations = makeOrderCalculations({
          orderType: state.orderData.type,
          amounts: state.orderData.amounts,
          limitPrice: action.limitPrice,
          slippage: state.orderData.slippage,
          pools: state.orderData.pools,
          tokens: state.orderData.tokens,
          lpTokenHeld: state.orderData.lpTokenHeld,
          side: 'sell',
          frontendFeeTiers: state.orderData.frontendFeeTiers,
        })
        draft.orderData.bestPoolCalculation = getBestPoolCalculation(
          draft.orderData.calculations,
        )
        draft.orderData.selectedPoolCalculation =
          selectedPoolCalculationSelector(draft.orderData)

        if (draft.orderData.selectedPoolCalculation === undefined) break

        draft.orderData.amounts.buy =
          draft.orderData.selectedPoolCalculation.sides.buy
        break

      // updating sell side will recalculate buy side
      // the pool will be automatically selected only if
      // there is no selected pool (limit order)
      case SwapCreateOrderActionType.SellQuantityChanged:
        draft.orderData.amounts.sell.quantity = action.quantity

        draft.orderData.calculations = makeOrderCalculations({
          orderType: state.orderData.type,
          amounts: draft.orderData.amounts,
          limitPrice: state.orderData.limitPrice,
          slippage: state.orderData.slippage,
          pools: state.orderData.pools,
          tokens: state.orderData.tokens,
          lpTokenHeld: state.orderData.lpTokenHeld,
          side: 'sell',
          frontendFeeTiers: state.orderData.frontendFeeTiers,
        })
        draft.orderData.bestPoolCalculation = getBestPoolCalculation(
          draft.orderData.calculations,
        )
        draft.orderData.selectedPoolCalculation =
          selectedPoolCalculationSelector(draft.orderData)

        if (draft.orderData.selectedPoolCalculation === undefined) break

        draft.orderData.amounts.buy =
          draft.orderData.selectedPoolCalculation.sides.buy
        break

      // updating buy side will recalculate sell side
      // the pool will be automatically selected only if
      // there is no selected pool (limit order)
      case SwapCreateOrderActionType.BuyQuantityChanged:
        draft.orderData.amounts.buy.quantity = action.quantity

        draft.orderData.calculations = makeOrderCalculations({
          orderType: state.orderData.type,
          amounts: draft.orderData.amounts,
          limitPrice: state.orderData.limitPrice,
          slippage: state.orderData.slippage,
          pools: state.orderData.pools,
          tokens: state.orderData.tokens,
          lpTokenHeld: state.orderData.lpTokenHeld,
          side: 'buy',
          frontendFeeTiers: state.orderData.frontendFeeTiers,
        })
        draft.orderData.bestPoolCalculation = getBestPoolCalculation(
          draft.orderData.calculations,
        )
        draft.orderData.selectedPoolCalculation =
          selectedPoolCalculationSelector(draft.orderData)

        if (draft.orderData.selectedPoolCalculation === undefined) break

        draft.orderData.amounts.sell =
          draft.orderData.selectedPoolCalculation.sides.sell
        break

      // when changing token info, all the derivaded data is reset
      // and the selected pool is reset
      case SwapCreateOrderActionType.SellTokenInfoChanged:
        draft.orderData.tokens.sellInfo = action.tokenInfo
        draft.orderData.amounts.sell.tokenId = action.tokenInfo.id
        draft.orderData.tokens.priceDenomination =
          action.tokenInfo.decimals - state.orderData.tokens.buyInfo.decimals

        draft.orderData.amounts.sell.quantity = Quantities.decimalPlaces(
          Quantities.denominated(
            state.orderData.amounts.sell.quantity,
            state.orderData.tokens.sellInfo.decimals -
              action.tokenInfo.decimals,
          ),
          0,
        )

        draft.orderData.pools = []

        draft.orderData.calculations = []
        draft.orderData.bestPoolCalculation = undefined
        draft.orderData.selectedPoolId = undefined
        draft.orderData.selectedPoolCalculation = undefined
        break

      // when changing token info, all the derivaded data is reset
      // and the selected pool is reset
      case SwapCreateOrderActionType.BuyTokenInfoChanged:
        draft.orderData.tokens.buyInfo = action.tokenInfo
        draft.orderData.amounts.buy.tokenId = action.tokenInfo.id
        draft.orderData.tokens.priceDenomination =
          state.orderData.tokens.sellInfo.decimals - action.tokenInfo.decimals

        draft.orderData.pools = []

        draft.orderData.calculations = []
        draft.orderData.bestPoolCalculation = undefined
        draft.orderData.selectedPoolId = undefined
        draft.orderData.selectedPoolCalculation = undefined
        break

      // when the lp token held changes, the calculations are updated
      // buy side needs recalculation since best pool can change
      case SwapCreateOrderActionType.LpTokenHeldChanged:
        draft.orderData.lpTokenHeld = action.amount

        draft.orderData.calculations = makeOrderCalculations({
          orderType: state.orderData.type,
          amounts: state.orderData.amounts,
          limitPrice: state.orderData.limitPrice,
          slippage: state.orderData.slippage,
          pools: state.orderData.pools,
          tokens: state.orderData.tokens,
          lpTokenHeld: action.amount,
          frontendFeeTiers: state.orderData.frontendFeeTiers,
          side: 'sell',
        })
        draft.orderData.bestPoolCalculation = getBestPoolCalculation(
          draft.orderData.calculations,
        )
        draft.orderData.selectedPoolCalculation =
          selectedPoolCalculationSelector(draft.orderData)

        if (draft.orderData.selectedPoolCalculation === undefined) break

        draft.orderData.amounts.buy =
          draft.orderData.selectedPoolCalculation.sides.buy
        break

      // when the frontend feee tiers changes, the calculations are updated
      // buy side needs recalculation since best pool can change
      // NOTE: designed to be loaded once at the initialization
      case SwapCreateOrderActionType.FrontendFeeTiersChanged:
        draft.orderData.frontendFeeTiers = [...action.feeTiers]

        draft.orderData.calculations = makeOrderCalculations({
          orderType: state.orderData.type,
          amounts: state.orderData.amounts,
          limitPrice: state.orderData.limitPrice,
          slippage: state.orderData.slippage,
          pools: state.orderData.pools,
          tokens: state.orderData.tokens,
          lpTokenHeld: state.orderData.lpTokenHeld,
          frontendFeeTiers: state.orderData.frontendFeeTiers,
          side: 'sell',
        })
        draft.orderData.bestPoolCalculation = getBestPoolCalculation(
          draft.orderData.calculations,
        )
        draft.orderData.selectedPoolCalculation =
          selectedPoolCalculationSelector(draft.orderData)

        if (draft.orderData.selectedPoolCalculation === undefined) break

        draft.orderData.amounts.buy =
          draft.orderData.selectedPoolCalculation.sides.buy
        break

      // when the pool pair changes, the calculations are updated
      // buy side needs recalculation since best pool can change
      // reset limit and selected pool - since it can  be gone
      case SwapCreateOrderActionType.PoolPairsChanged:
        draft.orderData.pools = [...action.pools]
        draft.orderData.calculations = makeOrderCalculations({
          orderType: state.orderData.type,
          amounts: state.orderData.amounts,
          limitPrice: undefined,
          slippage: state.orderData.slippage,
          pools: draft.orderData.pools,
          tokens: state.orderData.tokens,
          lpTokenHeld: state.orderData.lpTokenHeld,
          side: 'sell',
          frontendFeeTiers: state.orderData.frontendFeeTiers,
        })
        draft.orderData.bestPoolCalculation = getBestPoolCalculation(
          draft.orderData.calculations,
        )
        draft.orderData.selectedPoolCalculation =
          selectedPoolCalculationSelector(draft.orderData)

        draft.orderData.limitPrice = undefined
        draft.orderData.selectedPoolId = undefined

        if (draft.orderData.selectedPoolCalculation === undefined) break

        draft.orderData.limitPrice =
          state.orderData.type === 'limit'
            ? draft.orderData.bestPoolCalculation?.prices.market
            : undefined

        draft.orderData.amounts.buy =
          draft.orderData.selectedPoolCalculation.sides.buy
        break

      // NOTE: designed to be loaded once at the initialization
      case SwapCreateOrderActionType.PrimaryTokenInfoChanged:
        draft.orderData.tokens.ptInfo = action.tokenInfo
        break
    }
  })
}

const swapReducer = (state: SwapState, action: SwapAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case SwapActionType.UnsignedTxChanged:
        draft.unsignedTx = action.unsignedTx
        break
      case SwapActionType.ResetState:
        draft.orderData = {
          ...defaultSwapState.orderData,
          calculations: [...defaultSwapState.orderData.calculations],
          pools: [...defaultSwapState.orderData.pools],
          frontendFeeTiers: [...defaultSwapState.orderData.frontendFeeTiers],
        }
        draft.unsignedTx = defaultSwapState.unsignedTx
        break
    }
  })
}

/* istanbul ignore next */
function missingInit() {
  console.error('[@yoroi/swap] missing initialization')
}
