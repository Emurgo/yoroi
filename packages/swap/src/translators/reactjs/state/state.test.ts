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
      draft.createOrder.type = 'limit'
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
      draft.createOrder.type = 'limit'
    })

    const expectedState = produce(limitedState, (draft) => {
      draft.createOrder.type = 'market'
    })
    const state = combinedSwapReducers(limitedState, action)
    expect(state).toEqual(expectedState)
  })

  it('SellAmountChanged zero', () => {
    const action: SwapCreateOrderAction = {
      type: SwapCreateOrderActionType.SellAmountChanged,
      amount: {quantity: '0', tokenId: 'someTokenId'},
    }
    const expectedState = produce(mockSwapStateDefault, (draft) => {
      draft.createOrder.amounts.sell = action.amount
      draft.createOrder.amounts.buy.quantity = '0'
    })
    const state = combinedSwapReducers(mockSwapStateDefault, action)
    expect(state).toEqual(expectedState)
  })

  it('SellAmountChanged market', () => {
    const action: SwapCreateOrderAction = {
      type: SwapCreateOrderActionType.SellAmountChanged,
      amount: {quantity: '100', tokenId: 'someTokenId'},
    }
    const expectedState = produce(mockSwapStateDefault, (draft) => {
      draft.createOrder.amounts.sell = action.amount
    })
    const state = combinedSwapReducers(mockSwapStateDefault, action)
    expect(state).toEqual(expectedState)
  })

  it('SellAmountChanged limit', () => {
    const action: SwapCreateOrderAction = {
      type: SwapCreateOrderActionType.SellAmountChanged,
      amount: {quantity: '100', tokenId: 'someTokenId'},
    }
    const limitedState = produce(mockSwapStateDefault, (draft) => {
      draft.createOrder.type = 'limit'
    })

    const expectedState = produce(limitedState, (draft) => {
      draft.createOrder.amounts.sell = action.amount
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

  it('BuyAmountChanged zero', () => {
    const action: SwapCreateOrderAction = {
      type: SwapCreateOrderActionType.BuyAmountChanged,
      amount: {quantity: '0', tokenId: 'someTokenId'},
    }
    const expectedState = produce(mockSwapStateDefault, (draft) => {
      draft.createOrder.amounts.buy = action.amount
      draft.createOrder.amounts.sell.quantity = `0`
    })
    const state = combinedSwapReducers(mockSwapStateDefault, action)
    expect(state).toEqual(expectedState)
  })

  it('BuyAmountChanged market', () => {
    const action: SwapCreateOrderAction = {
      type: SwapCreateOrderActionType.BuyAmountChanged,
      amount: {quantity: '100', tokenId: 'someTokenId'},
    }
    const expectedState = produce(mockSwapStateDefault, (draft) => {
      draft.createOrder.amounts.buy = action.amount
      draft.createOrder.amounts.sell.quantity = `1`
    })
    const state = combinedSwapReducers(mockSwapStateDefault, action)
    expect(state).toEqual(expectedState)
  })

  it('BuyAmountChanged limit', () => {
    const action: SwapCreateOrderAction = {
      type: SwapCreateOrderActionType.BuyAmountChanged,
      amount: {quantity: '100', tokenId: 'someTokenId'},
    }

    const limitedState = produce(mockSwapStateDefault, (draft) => {
      draft.createOrder.type = 'limit'
    })

    const expectedState = produce(limitedState, (draft) => {
      draft.createOrder.amounts.buy = action.amount
      draft.createOrder.amounts.sell.quantity = `1`
    })
    const state = combinedSwapReducers(limitedState, action)
    expect(state).toEqual(expectedState)
  })

  it('SelectedPoolChanged market', () => {
    const action: SwapCreateOrderAction = {
      type: SwapCreateOrderActionType.SelectedPoolChanged,
      pool: {
        provider: 'sundaeswap',
        fee: '0.5',
        batcherFee: {tokenId: '', quantity: '1'},
        deposit: {tokenId: '', quantity: '1'},
        lpToken: {tokenId: '', quantity: '1'},
        poolId: '1',
        price: 1,
        tokenA: {tokenId: '', quantity: '1'},
        tokenB: {tokenId: '', quantity: '1'},
        tokenAPriceLovelace: '1',
        tokenBPriceLovelace: '1',
      },
    }
    const expectedState = produce(mockSwapStateDefault, (draft) => {
      draft.createOrder.selectedPool = action.pool
      draft.createOrder.marketPrice = '1'
      draft.createOrder.limitPrice = '1'
    })
    const state = combinedSwapReducers(mockSwapStateDefault, action)
    expect(state).toEqual(expectedState)
  })

  it('SelectedPoolChanged limit', () => {
    const action: SwapCreateOrderAction = {
      type: SwapCreateOrderActionType.SelectedPoolChanged,
      pool: {
        provider: 'sundaeswap',
        fee: '0.5',
        batcherFee: {tokenId: '', quantity: '1'},
        deposit: {tokenId: '', quantity: '1'},
        lpToken: {tokenId: '', quantity: '1'},
        poolId: '1',
        price: 1,
        tokenA: {tokenId: '', quantity: '1'},
        tokenB: {tokenId: '', quantity: '1'},
        tokenAPriceLovelace: '1',
        tokenBPriceLovelace: '1',
      },
    }

    const limitedState = produce(mockSwapStateDefault, (draft) => {
      draft.createOrder.type = 'limit'
    })

    const expectedState = produce(limitedState, (draft) => {
      draft.createOrder.selectedPool = action.pool
      draft.createOrder.marketPrice = '1'
      draft.createOrder.limitPrice = '1'
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
      draft.createOrder.slippage = action.slippage
    })
    const state = combinedSwapReducers(mockSwapStateDefault, action)
    expect(state).toEqual(expectedState)
  })

  it('TxPayloadChanged', () => {
    const action: SwapCreateOrderAction = {
      type: SwapCreateOrderActionType.TxPayloadChanged,
      txPayload: {
        datum: 'datum',
        datumHash: 'hash',
        contractAddress: 'address',
      },
    }
    const expectedState = produce(mockSwapStateDefault, (draft) => {
      draft.createOrder.datum = action.txPayload.datum
      draft.createOrder.datumHash = action.txPayload.datumHash
      draft.createOrder.address = action.txPayload.contractAddress
    })
    const state = combinedSwapReducers(mockSwapStateDefault, action)
    expect(state).toEqual(expectedState)
  })

  it('SwitchTokens', () => {
    const action: SwapCreateOrderAction = {
      type: SwapCreateOrderActionType.SwitchTokens,
    }
    const expectedState = produce(mockSwapStateDefault, (draft) => {
      draft.createOrder.amounts = {
        sell: mockSwapStateDefault.createOrder.amounts.buy,
        buy: mockSwapStateDefault.createOrder.amounts.sell,
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
      draft.createOrder.amounts = {
        sell: {
          quantity: '0',
          tokenId: mockSwapStateDefault.createOrder.amounts.sell.tokenId,
        },
        buy: {
          quantity: '0',
          tokenId: mockSwapStateDefault.createOrder.amounts.buy.tokenId,
        },
      }
      draft.createOrder.limitPrice =
        mockSwapStateDefault.createOrder.marketPrice
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
      draft.createOrder.limitPrice = action.limitPrice
    })
    const state = combinedSwapReducers(mockSwapStateDefault, action)
    expect(state).toEqual(expectedState)
  })
})
