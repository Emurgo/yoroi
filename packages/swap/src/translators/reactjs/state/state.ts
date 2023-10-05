import {Balance, Swap} from '@yoroi/types'
import {produce} from 'immer'

import {getBuyAmount} from '../../../helpers/orders/getBuyAmount'
import {getSellAmount} from '../../../helpers/orders/getSellAmount'
import {Quantities} from '../../../utils/quantities'
import {SwapDiscountTier} from '../../../translators/constants'
import {makeOrderCalculations} from '../../../helpers/orders/makeOrderCalculations'

export type SwapOrderCalulation = Readonly<{
  pool: Swap.Pool
  prices: {
    base: Balance.Quantity
    market: Balance.Quantity
    withFees: Balance.Quantity
    difference: Balance.Quantity
    withSlippage: Balance.Quantity
    withFeesAndSlippage: Balance.Quantity
  }
  hasSupply: boolean
  buyAmountWithSlippage: Balance.Amount
  cost: {
    liquidityFee: Balance.Amount
    deposit: Balance.Amount
    batcherFee: Balance.Amount
    frontendFeeInfo: {
      discountTier?: SwapDiscountTier
      fee: Balance.Amount
    }
  }
}>

export type SwapState = Readonly<{
  orderData: {
    type: Swap.OrderType
    amounts: {
      sell: Balance.Amount
      buy: Balance.Amount
    }
    slippage: number
    limitPrice?: Balance.Quantity
    maybeLimitPrice?: Readonly<Balance.Quantity>
    selectedPoolId?: string
    bestPool?: SwapOrderCalulation
    calculatedPool?: Readonly<SwapOrderCalulation>
    pools: ReadonlyArray<Swap.Pool>

    calculations: ReadonlyArray<SwapOrderCalulation>

    // TODO: kind of metadata: - slippage, type, marketPrice should be moved in here too
    marketPrice: Balance.Quantity
    lpTokenHeld?: Balance.Amount
    // primary token price in terms of sell/buy token
    ptPrices: {
      sell?: Balance.Quantity
      buy?: Balance.Quantity
    }
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
  sellTokenIdChanged: (payload: {
    tokenId: Balance.TokenInfo['id']
    pools: ReadonlyArray<Swap.Pool>
  }) => void
  buyTokenIdChanged: (payload: {
    tokenId: Balance.TokenInfo['id']
    pools: ReadonlyArray<Swap.Pool>
  }) => void
  poolPairsChanged: (pools: ReadonlyArray<Swap.Pool>) => void
  lpTokenHeldChanged: (amount: Balance.Amount | undefined) => void
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
  SellTokenIdChanged = 'sellTokenIdChanged',
  BuyTokenIdChanged = 'buyTokenIdChanged',
  PoolPairsChanged = 'poolPairsChanged',
  LpTokenHeldChanged = 'lpTokenHeldChanged',
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
      type: SwapCreateOrderActionType.SellTokenIdChanged
      payload: {
        tokenId: Balance.TokenInfo['id']
        pools: ReadonlyArray<Swap.Pool>
      }
    }
  | {
      type: SwapCreateOrderActionType.BuyTokenIdChanged
      payload: {
        tokenId: Balance.TokenInfo['id']
        pools: ReadonlyArray<Swap.Pool>
      }
    }
  | {
      type: SwapCreateOrderActionType.PoolPairsChanged
      pools: ReadonlyArray<Swap.Pool>
    }
  | {
      type: SwapCreateOrderActionType.LpTokenHeldChanged
      amount: Balance.Amount | undefined
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
    get maybeLimitPrice() {
      return this.type === 'limit' ? this.limitPrice : undefined
    },
    selectedPoolId: undefined,
    bestPool: undefined,
    get calculatedPool() {
      return this.type === 'limit' && this.selectedPoolId !== undefined
        ? this.calculations.find(
            ({pool}) => pool.poolId === this.selectedPoolId,
          ) ?? this.bestPool
        : this.bestPool
    },
    get marketPrice() {
      const pool = this.calculatedPool

      return pool === undefined ? Quantities.zero : pool.prices.market
    },
    calculations: [] as const,
    lpTokenHeld: undefined,
    ptPrices: {
      sell: '0',
      buy: '0',
    },
    pools: [] as const,
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
  sellTokenIdChanged: missingInit,
  buyTokenIdChanged: missingInit,
  poolPairsChanged: missingInit,
  lpTokenHeldChanged: missingInit,
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
      case SwapCreateOrderActionType.OrderTypeChanged:
        draft.orderData.type = action.orderType

        draft.orderData.calculations = makeOrderCalculations({
          orderType: action.orderType,
          amounts: state.orderData.amounts,
          limitPrice: state.orderData.limitPrice,
          slippage: state.orderData.slippage,
          ptPrices: state.orderData.ptPrices,
          pools: state.orderData.pools,
          primaryTokenId: '',
          lpTokenHeld: state.orderData.lpTokenHeld,
        })

        draft.orderData.bestPool = draft.orderData.calculations.find(() => true)

        if (draft.orderData.calculatedPool === undefined) break

        draft.orderData.amounts.buy = getBuyAmount(
          draft.orderData.calculatedPool.pool,
          state.orderData.amounts.sell,
          draft.orderData.maybeLimitPrice,
        )
        break

      case SwapCreateOrderActionType.SelectedPoolChanged:
        draft.orderData.selectedPoolId = action.poolId

        if (draft.orderData.calculatedPool === undefined) break

        draft.orderData.amounts.buy = getBuyAmount(
          draft.orderData.calculatedPool.pool,
          state.orderData.amounts.sell,
          state.orderData.maybeLimitPrice,
        )
        break

      case SwapCreateOrderActionType.SlippageChanged:
        draft.orderData.slippage = action.slippage

        draft.orderData.calculations = makeOrderCalculations({
          orderType: state.orderData.type,
          amounts: state.orderData.amounts,
          limitPrice: state.orderData.limitPrice,
          slippage: action.slippage,
          ptPrices: state.orderData.ptPrices,
          pools: state.orderData.pools,
          primaryTokenId: '',
          lpTokenHeld: state.orderData.lpTokenHeld,
        })

        draft.orderData.bestPool = draft.orderData.calculations.find(() => true)
        break

      case SwapCreateOrderActionType.SwitchTokens:
        draft.orderData.amounts = {
          sell: state.orderData.amounts.buy,
          buy: state.orderData.amounts.sell,
        }

        draft.orderData.calculations = makeOrderCalculations({
          orderType: state.orderData.type,
          amounts: draft.orderData.amounts,
          limitPrice: state.orderData.limitPrice,
          slippage: state.orderData.slippage,
          ptPrices: state.orderData.ptPrices,
          pools: state.orderData.pools,
          primaryTokenId: '',
          lpTokenHeld: state.orderData.lpTokenHeld,
        })

        draft.orderData.bestPool = draft.orderData.calculations.find(() => true)
        if (draft.orderData.calculatedPool === undefined) break

        if (
          draft.orderData.amounts.sell.tokenId ===
          draft.orderData.calculatedPool.pool.tokenA.tokenId
        ) {
          draft.orderData.amounts.buy = getBuyAmount(
            draft.orderData.calculatedPool.pool,
            draft.orderData.amounts.sell,
            draft.orderData.maybeLimitPrice,
          )
        } else {
          draft.orderData.amounts.sell = getSellAmount(
            draft.orderData.calculatedPool.pool,
            draft.orderData.amounts.buy,
            draft.orderData.maybeLimitPrice,
          )
        }
        break

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

        draft.orderData.calculations = makeOrderCalculations({
          orderType: state.orderData.type,
          amounts: draft.orderData.amounts,
          limitPrice: state.orderData.limitPrice,
          slippage: state.orderData.slippage,
          ptPrices: state.orderData.ptPrices,
          pools: state.orderData.pools,
          primaryTokenId: '',
          lpTokenHeld: state.orderData.lpTokenHeld,
        })

        draft.orderData.bestPool = draft.orderData.calculations.find(() => true)

        draft.orderData.limitPrice = draft.orderData.bestPool?.prices.market

        break

      case SwapCreateOrderActionType.LimitPriceChanged:
        draft.orderData.limitPrice = action.limitPrice

        if (state.orderData.type !== 'limit') break

        draft.orderData.calculations = makeOrderCalculations({
          orderType: state.orderData.type,
          amounts: state.orderData.amounts,
          limitPrice: action.limitPrice,
          slippage: state.orderData.slippage,
          ptPrices: state.orderData.ptPrices,
          pools: state.orderData.pools,
          primaryTokenId: '',
          lpTokenHeld: state.orderData.lpTokenHeld,
        })
        draft.orderData.bestPool = draft.orderData.calculations.find(() => true)

        if (draft.orderData.calculatedPool === undefined) break

        draft.orderData.amounts.buy = getBuyAmount(
          draft.orderData.calculatedPool.pool,
          state.orderData.amounts.sell,
          action.limitPrice,
        )
        break

      //
      case SwapCreateOrderActionType.SellQuantityChanged:
        draft.orderData.amounts.sell.quantity = action.quantity

        draft.orderData.calculations = makeOrderCalculations({
          orderType: state.orderData.type,
          amounts: draft.orderData.amounts,
          limitPrice: state.orderData.limitPrice,
          slippage: state.orderData.slippage,
          ptPrices: state.orderData.ptPrices,
          pools: state.orderData.pools,
          primaryTokenId: '',
          lpTokenHeld: state.orderData.lpTokenHeld,
          action: 'sell',
        })
        draft.orderData.bestPool = draft.orderData.calculations.find(() => true)
        break

      case SwapCreateOrderActionType.BuyQuantityChanged:
        draft.orderData.amounts.buy.quantity = action.quantity

        draft.orderData.calculations = makeOrderCalculations({
          orderType: state.orderData.type,
          amounts: draft.orderData.amounts,
          limitPrice: state.orderData.limitPrice,
          slippage: state.orderData.slippage,
          ptPrices: state.orderData.ptPrices,
          pools: state.orderData.pools,
          primaryTokenId: '',
          lpTokenHeld: state.orderData.lpTokenHeld,
          action: 'buy',
        })
        draft.orderData.bestPool = draft.orderData.calculations.find(() => true)
        break

      case SwapCreateOrderActionType.SellTokenIdChanged:
        draft.orderData.amounts.sell.tokenId = action.payload.tokenId
        draft.orderData.pools = [...action.payload.pools]

        draft.orderData.calculations = makeOrderCalculations({
          orderType: state.orderData.type,
          amounts: draft.orderData.amounts,
          limitPrice: state.orderData.limitPrice,
          slippage: state.orderData.slippage,
          ptPrices: state.orderData.ptPrices,
          pools: draft.orderData.pools,
          primaryTokenId: '',
          lpTokenHeld: state.orderData.lpTokenHeld,
          action: 'sell',
        })
        draft.orderData.bestPool = draft.orderData.calculations.find(() => true)
        break

      case SwapCreateOrderActionType.BuyTokenIdChanged:
        draft.orderData.amounts.buy.tokenId = action.payload.tokenId
        draft.orderData.pools = [...action.payload.pools]

        draft.orderData.calculations = makeOrderCalculations({
          orderType: state.orderData.type,
          amounts: draft.orderData.amounts,
          limitPrice: state.orderData.limitPrice,
          slippage: state.orderData.slippage,
          ptPrices: state.orderData.ptPrices,
          pools: draft.orderData.pools,
          primaryTokenId: '',
          lpTokenHeld: state.orderData.lpTokenHeld,
          action: 'buy',
        })
        draft.orderData.bestPool = draft.orderData.calculations.find(() => true)
        break

      case SwapCreateOrderActionType.LpTokenHeldChanged:
        draft.orderData.lpTokenHeld = action.amount

        draft.orderData.calculations = makeOrderCalculations({
          orderType: state.orderData.type,
          amounts: state.orderData.amounts,
          limitPrice: state.orderData.limitPrice,
          slippage: state.orderData.slippage,
          ptPrices: state.orderData.ptPrices,
          pools: state.orderData.pools,
          primaryTokenId: '',
          lpTokenHeld: action.amount,
        })
        draft.orderData.bestPool = draft.orderData.calculations.find(() => true)
        break

      case SwapCreateOrderActionType.PoolPairsChanged:
        draft.orderData.pools = [...action.pools]
        draft.orderData.calculations = makeOrderCalculations({
          orderType: state.orderData.type,
          amounts: state.orderData.amounts,
          limitPrice: state.orderData.limitPrice,
          slippage: state.orderData.slippage,
          ptPrices: state.orderData.ptPrices,
          pools: draft.orderData.pools,
          primaryTokenId: '',
          lpTokenHeld: state.orderData.lpTokenHeld,
        })
        draft.orderData.bestPool = draft.orderData.calculations.find(() => true)
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
