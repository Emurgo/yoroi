import {Balance, Swap} from '@yoroi/types'
import {produce} from 'immer'

import {getBuyAmount} from '../../../helpers/orders/getBuyAmount'
import {getSellAmount} from '../../../helpers/orders/getSellAmount'
import {getMarketPrice} from '../../../helpers/orders/getMarketPrice'
import {Quantities} from '../../../utils/quantities'
import {SwapDiscountTier} from '../../../translators/constants'

export type SwapOrderCalulation = Readonly<{
  pool: Swap.Pool
  prices: {
    base: string
    market: string
    withFees: string
    difference: string
    withSlippage: string
    withFeesAndSlippage: string
  }
  buyAmountWithSlippage: Balance.Amount
  cost: {
    liquidityFee: Balance.Amount
    deposit: Balance.Amount
    batcherFee: Balance.Amount
    frontendFeeInfo: {
      discountTier: SwapDiscountTier | undefined
      fee: Balance.Amount
    }
  }
}>

export type SwapState = Readonly<{
  createOrder: Omit<Swap.CreateOrderData, 'selectedPool'> & {
    type: Swap.OrderType
    marketPrice: Balance.Quantity
    // TODO: is the datum in the state in use?
    datum: string
    datumHash: string

    // TODO: this will probably change after calculations - maybe the selected index?
    selectedPool?: Swap.Pool

    //
    calculations: Array<SwapOrderCalulation>
    // TODO: kind of metadata: - slippage, type, marketPrice should be moved in here too
    lpTokenHeld: Balance.Amount | undefined
    // primary token price in terms of sell/buy token
    ptPrices: {
      sell: string
      buy: string
    }
  }
  unsignedTx: any
}>

export type SwapCreateOrderActions = Readonly<{
  orderTypeChanged: (orderType: Swap.OrderType) => void
  sellAmountChanged: (sellAmount: Readonly<Balance.Amount>) => void
  buyAmountChanged: (buyAmount: Readonly<Balance.Amount>) => void
  selectedPoolChanged: (pool?: Readonly<Swap.Pool>) => void
  slippageChanged: (slippage: number) => void
  txPayloadChanged: (txPayload: Readonly<Swap.CreateOrderResponse>) => void
  switchTokens: () => void
  resetQuantities: () => void
  limitPriceChanged: (limitPrice: Balance.Quantity) => void
  //
  // TODO: when changing quantity/token should receive & update the ADA pair along with it
  sellQuantityChanged: (quantity: Balance.Quantity) => void
  buyQuantityChanged: (quantity: Balance.Quantity) => void
  sellTokenIdChanged: (tokenId: Balance.TokenInfo['id']) => void
  buyTokenIdChanged: (tokenId: Balance.TokenInfo['id']) => void
  poolPairsChanged: (pools: ReadonlyArray<Swap.Pool>) => void
  lpTokenHeldChanged: (amount: Balance.Amount | undefined) => void
}>

export enum SwapCreateOrderActionType {
  OrderTypeChanged = 'orderTypeChanged',
  SellAmountChanged = 'sellAmountChanged',
  BuyAmountChanged = 'buyAmountChanged',
  ProtocolChanged = 'protocolChanged',
  SelectedPoolChanged = 'selectedPoolChanged',
  SlippageChanged = 'slippageChanged',
  TxPayloadChanged = 'txPayloadChanged',
  SwitchTokens = 'switchTokens',
  ResetQuantities = 'resetQuantities',
  LimitPriceChanged = 'limitPriceChanged',
  //
  SellQuantityChanged = 'sellQuantityChanged',
  BuyQuantityChanged = 'buyQuantityChanged',
  SellTokenIdChanged = 'sellTokenIdChanged',
  BuyTokenIdChanged = 'buyTokenIdChanged',
  PoolPairsChanged = 'poolPairsChanged',
  lpTokenHeldChanged = 'lpTokenHeldChanged',
}

export type SwapCreateOrderAction =
  | {
      type: SwapCreateOrderActionType.OrderTypeChanged
      orderType: Swap.OrderType
    }
  | {
      type: SwapCreateOrderActionType.SellAmountChanged
      amount: Readonly<Balance.Amount>
    }
  | {
      type: SwapCreateOrderActionType.BuyAmountChanged
      amount: Readonly<Balance.Amount>
    }
  | {
      type: SwapCreateOrderActionType.ProtocolChanged
      protocol: Swap.Protocol
    }
  | {
      type: SwapCreateOrderActionType.SelectedPoolChanged
      pool?: Readonly<Swap.Pool>
    }
  | {
      type: SwapCreateOrderActionType.SlippageChanged; // prettier-ignore
      slippage: number
    }
  | {
      type: SwapCreateOrderActionType.TxPayloadChanged
      txPayload: Readonly<Swap.CreateOrderResponse>
    }
  | {
      type: SwapCreateOrderActionType.LimitPriceChanged
      limitPrice: Balance.Quantity
    }
  | {type: SwapCreateOrderActionType.SwitchTokens}
  | {type: SwapCreateOrderActionType.ResetQuantities}
  //
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
      tokenId: Balance.TokenInfo['id']
    }
  | {
      type: SwapCreateOrderActionType.BuyTokenIdChanged
      tokenId: Balance.TokenInfo['id']
    }
  | {
      type: SwapCreateOrderActionType.PoolPairsChanged
      pools: ReadonlyArray<Swap.Pool>
    }
  | {
      type: SwapCreateOrderActionType.lpTokenHeldChanged
      amount: Balance.Amount
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
        ...createOrderReducer(state, action as SwapCreateOrderAction),
      },
      action as SwapAction,
    ),
  } as const
}

export const defaultSwapState: SwapState = {
  createOrder: {
    type: 'market',
    address: '',
    datum: '',
    datumHash: '',
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
    limitPrice: Quantities.zero,
    marketPrice: Quantities.zero,
    selectedPool: undefined,
    //
    calculations: [],
    lpTokenHeld: undefined,
    ptPrices: {
      sell: '0',
      buy: '0',
    },
  },
  unsignedTx: undefined,
} as const

const defaultSwapCreateOrderActions: SwapCreateOrderActions = {
  orderTypeChanged: missingInit,
  sellAmountChanged: missingInit,
  buyAmountChanged: missingInit,
  selectedPoolChanged: missingInit,
  slippageChanged: missingInit,
  txPayloadChanged: missingInit,
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

const createOrderReducer = (
  state: Readonly<SwapState>,
  action: Readonly<SwapCreateOrderAction>,
) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case SwapCreateOrderActionType.OrderTypeChanged:
        draft.createOrder.type = action.orderType

        if (state.createOrder.selectedPool === undefined) break

        draft.createOrder.amounts.buy = getBuyAmount(
          state.createOrder.selectedPool,
          state.createOrder.amounts.sell,
          action.orderType === 'limit'
            ? state.createOrder.limitPrice
            : undefined,
        )
        break

      case SwapCreateOrderActionType.SellAmountChanged:
        draft.createOrder.amounts.sell = action.amount
        if (
          Quantities.isZero(action.amount.quantity) ||
          state.createOrder.selectedPool === undefined
        ) {
          draft.createOrder.amounts.buy.quantity = Quantities.zero
        } else {
          draft.createOrder.amounts.buy = getBuyAmount(
            state.createOrder.selectedPool,
            action.amount,
            state.createOrder.type === 'limit'
              ? state.createOrder.limitPrice
              : undefined,
          )
        }
        break

      case SwapCreateOrderActionType.BuyAmountChanged:
        draft.createOrder.amounts.buy = action.amount
        if (
          Quantities.isZero(action.amount.quantity) ||
          state.createOrder.selectedPool === undefined
        ) {
          draft.createOrder.amounts.sell.quantity = Quantities.zero
        } else {
          draft.createOrder.amounts.sell = getSellAmount(
            state.createOrder.selectedPool,
            action.amount,
            state.createOrder.type === 'limit'
              ? state.createOrder.limitPrice
              : undefined,
          )
        }
        break

      case SwapCreateOrderActionType.SelectedPoolChanged:
        draft.createOrder.selectedPool = action.pool
        if (action.pool === undefined) {
          draft.createOrder.marketPrice = Quantities.zero
          draft.createOrder.limitPrice = Quantities.zero
        } else {
          draft.createOrder.marketPrice = getMarketPrice(
            action.pool,
            state.createOrder.amounts.sell,
          )
          draft.createOrder.limitPrice = draft.createOrder.marketPrice
          draft.createOrder.amounts.buy = getBuyAmount(
            action.pool,
            state.createOrder.amounts.sell,
            state.createOrder.type === 'limit'
              ? draft.createOrder.limitPrice
              : undefined,
          )
        }
        break

      case SwapCreateOrderActionType.SlippageChanged:
        draft.createOrder.slippage = action.slippage
        break

      case SwapCreateOrderActionType.TxPayloadChanged:
        draft.createOrder.datum = action.txPayload.datum
        draft.createOrder.datumHash = action.txPayload.datumHash
        draft.createOrder.address = action.txPayload.contractAddress
        break

      case SwapCreateOrderActionType.SwitchTokens:
        draft.createOrder.amounts = {
          sell: state.createOrder.amounts.buy,
          buy: state.createOrder.amounts.sell,
        }

        if (state.createOrder.selectedPool === undefined) break

        draft.createOrder.marketPrice = getMarketPrice(
          state.createOrder.selectedPool,
          draft.createOrder.amounts.sell,
        )
        draft.createOrder.limitPrice = draft.createOrder.marketPrice

        if (
          draft.createOrder.amounts.sell.tokenId ===
          state.createOrder.selectedPool.tokenA.tokenId
        ) {
          draft.createOrder.amounts.buy = getBuyAmount(
            state.createOrder.selectedPool,
            draft.createOrder.amounts.sell,
            state.createOrder.type === 'limit'
              ? draft.createOrder.limitPrice
              : undefined,
          )
        } else {
          draft.createOrder.amounts.sell = getSellAmount(
            state.createOrder.selectedPool,
            draft.createOrder.amounts.buy,
            state.createOrder.type === 'limit'
              ? draft.createOrder.limitPrice
              : undefined,
          )
        }
        break

      case SwapCreateOrderActionType.ResetQuantities:
        draft.createOrder.amounts = {
          sell: {
            quantity: Quantities.zero,
            tokenId: state.createOrder.amounts.sell.tokenId,
          },
          buy: {
            quantity: Quantities.zero,
            tokenId: state.createOrder.amounts.buy.tokenId,
          },
        }
        draft.createOrder.limitPrice = state.createOrder.marketPrice
        break

      case SwapCreateOrderActionType.LimitPriceChanged:
        draft.createOrder.limitPrice = action.limitPrice

        if (state.createOrder.selectedPool === undefined) break

        draft.createOrder.amounts.buy = getBuyAmount(
          state.createOrder.selectedPool,
          state.createOrder.amounts.sell,
          action.limitPrice,
        )
        break

      //
      case SwapCreateOrderActionType.SellQuantityChanged:
        draft.createOrder.amounts.sell.quantity = action.quantity
        break

      case SwapCreateOrderActionType.BuyQuantityChanged:
        draft.createOrder.amounts.buy.quantity = action.quantity
        break

      case SwapCreateOrderActionType.SellTokenIdChanged:
        draft.createOrder.amounts.sell.tokenId = action.tokenId
        break

      case SwapCreateOrderActionType.BuyTokenIdChanged:
        draft.createOrder.amounts.buy.tokenId = action.tokenId
        break

      case SwapCreateOrderActionType.lpTokenHeldChanged:
        draft.createOrder.lpTokenHeld = action.amount
        break

      case SwapCreateOrderActionType.PoolPairsChanged:
        draft.createOrder.calculations = action.pools.map((pool) => {
          return {
            buyAmountWithSlippage: {
              quantity: Quantities.zero,
              tokenId: state.createOrder.amounts.buy.tokenId,
            },
            sell: {
              price: '',
              priceDifference: '',
              priceWithFees: '',
              priceWithFeesAndSlippage: '',
              priceWithSlippage: '',
            },
            cost: {
              batcherFee: {
                quantity: Quantities.zero,
                tokenId: state.createOrder.amounts.buy.tokenId,
              },
              deposit: {
                quantity: Quantities.zero,
                tokenId: state.createOrder.amounts.buy.tokenId,
              },
              liquidityFee: {
                quantity: Quantities.zero,
                tokenId: state.createOrder.amounts.buy.tokenId,
              },
              frontendFeeInfo: {
                tier: undefined,
                fee: {
                  quantity: Quantities.zero,
                  tokenId: state.createOrder.amounts.buy.tokenId,
                },
              },
            },
            pool,
          }
        })
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
        draft.createOrder = defaultSwapState.createOrder
        draft.unsignedTx = defaultSwapState.unsignedTx
        break
    }
  })
}

/* istanbul ignore next */
function missingInit() {
  console.error('[@yoroi/swap] missing initialization')
}
