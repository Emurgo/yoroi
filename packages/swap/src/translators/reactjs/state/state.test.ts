import {produce} from 'immer'

import {
  combinedSwapReducers,
  defaultSwapState,
  SwapCreateOrderActionType,
  SwapActionType,
  SwapCreateOrderAction,
  SwapAction,
} from './state'
import {mockSwapStateDefault} from './state.mocks'

describe('State Actions', () => {
  it('unknown', () => {
    const action = {type: 'UNKNOWN'} as any
    const state = combinedSwapReducers(mockSwapStateDefault, action)
    expect(state).toEqual(mockSwapStateDefault)
  })

  it('OrderTypeChanged market', () => {
    const action: SwapCreateOrderAction = {
      type: SwapCreateOrderActionType.OrderTypeChanged,
      orderType: 'limit',
    }
    const expectedState = produce(mockSwapStateDefault, (draft) => {
      draft.orderData.type = 'limit'
    })
    const state = combinedSwapReducers(mockSwapStateDefault, action)
    expect(state).toEqual(expectedState)
  })

  it('OrderTypeChanged limit', () => {
    const action: SwapCreateOrderAction = {
      type: SwapCreateOrderActionType.OrderTypeChanged,
      orderType: 'market',
    }

    const limitedState = produce(mockSwapStateDefault, (draft) => {
      draft.orderData.type = 'limit'
    })

    const expectedState = produce(limitedState, (draft) => {
      draft.orderData.type = 'market'
    })
    const state = combinedSwapReducers(limitedState, action)
    expect(state).toEqual(expectedState)
  })

  it('UnsignedTxChanged', () => {
    const action: SwapAction = {
      type: SwapActionType.UnsignedTxChanged,
      unsignedTx: {txHash: 'someHash'},
    }
    const expectedState = produce(mockSwapStateDefault, (draft) => {
      draft.unsignedTx = {txHash: 'someHash'}
    })
    const state = combinedSwapReducers(mockSwapStateDefault, action)
    expect(state).toEqual(expectedState)
  })

  it('ResetState', () => {
    const action: SwapAction = {type: SwapActionType.ResetState}
    const state = combinedSwapReducers(mockSwapStateDefault, action)
    expect(state).toEqual(defaultSwapState)
  })

  it('SelectedPoolChanged market', () => {
    const action: SwapCreateOrderAction = {
      type: SwapCreateOrderActionType.SelectedPoolChanged,
      poolId: '',
    }
    const expectedState = produce(mockSwapStateDefault, (draft) => {
      draft.orderData.selectedPoolId = action.poolId
    })
    const state = combinedSwapReducers(mockSwapStateDefault, action)
    expect(state).toEqual(expectedState)
  })

  it('SelectedPoolChanged limit', () => {
    const action: SwapCreateOrderAction = {
      type: SwapCreateOrderActionType.SelectedPoolChanged,
      poolId: '',
    }

    const limitedState = produce(mockSwapStateDefault, (draft) => {
      draft.orderData.type = 'limit'
    })

    const expectedState = produce(limitedState, (draft) => {
      draft.orderData.selectedPoolId = action.poolId
    })
    const state = combinedSwapReducers(limitedState, action)
    expect(state).toEqual(expectedState)
  })

  it('SlippageChanged', () => {
    const action: SwapCreateOrderAction = {
      type: SwapCreateOrderActionType.SlippageChanged,
      slippage: 2,
    }
    const expectedState = produce(mockSwapStateDefault, (draft) => {
      draft.orderData.slippage = action.slippage
    })
    const state = combinedSwapReducers(mockSwapStateDefault, action)
    expect(state).toEqual(expectedState)
  })

  it('SwitchTokens', () => {
    const action: SwapCreateOrderAction = {
      type: SwapCreateOrderActionType.SwitchTokens,
    }
    const expectedState = produce(mockSwapStateDefault, (draft) => {
      draft.orderData.amounts = {
        sell: mockSwapStateDefault.orderData.amounts.buy,
        buy: mockSwapStateDefault.orderData.amounts.sell,
      }
    })
    const state = combinedSwapReducers(mockSwapStateDefault, action)
    expect(state).toEqual(expectedState)
  })

  it('ResetQuantities', () => {
    const action: SwapCreateOrderAction = {
      type: SwapCreateOrderActionType.ResetQuantities,
    }
    const expectedState = produce(mockSwapStateDefault, (draft) => {
      draft.orderData.amounts = {
        sell: {
          quantity: '0',
          tokenId: mockSwapStateDefault.orderData.amounts.sell.tokenId,
        },
        buy: {
          quantity: '0',
          tokenId: mockSwapStateDefault.orderData.amounts.buy.tokenId,
        },
      }
      draft.orderData.limitPrice = undefined
    })
    const state = combinedSwapReducers(mockSwapStateDefault, action)
    expect(state).toEqual(expectedState)
  })

  it('LimitPriceChanged', () => {
    const action: SwapCreateOrderAction = {
      type: SwapCreateOrderActionType.LimitPriceChanged,
      limitPrice: '2',
    }
    const expectedState = produce(mockSwapStateDefault, (draft) => {
      draft.orderData.limitPrice = action.limitPrice
    })
    const state = combinedSwapReducers(mockSwapStateDefault, action)
    expect(state).toEqual(expectedState)
  })

  //
  // TODO: implement
  it('SellTokenIdChanged', () => {
    expect('todo').toBeDefined()
  })
  it('BuyTokenIdChanged', () => {
    expect('todo').toBeDefined()
  })
  it('SellQuantityChanged', () => {
    expect('todo').toBeDefined()
  })
  it('BuyQuantityChanged', () => {
    expect('todo').toBeDefined()
  })
  it('PoolPairsChanged', () => {
    expect('todo').toBeDefined()
  })
  it('LpTokenHeldChanged', () => {
    expect('todo').toBeDefined()
  })
})
