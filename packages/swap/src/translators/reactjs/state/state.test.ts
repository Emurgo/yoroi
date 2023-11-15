import {produce} from 'immer'

import {
  combinedSwapReducers,
  defaultSwapState,
  SwapCreateOrderActionType,
  SwapActionType,
  SwapCreateOrderAction,
  SwapAction,
  SwapState,
} from './state'
import {mockSwapStateDefault} from './state.mocks'
import {mocks} from '../../../helpers/mocks'

// NOTE: the calculations are tested on the factories
// here is just testing the state behaviour
describe('State Actions', () => {
  const mockedState: SwapState = {
    ...mockSwapStateDefault,
    orderData: {
      ...mockSwapStateDefault.orderData,
      amounts: {
        sell: {
          quantity: '100000000',
          tokenId: 'tokenA',
        },
        buy: {
          quantity: '1401162647',
          tokenId: 'tokenB',
        },
      },
      limitPrice: undefined,
      slippage: 10,
      type: 'market',
      selectedPoolId: undefined,
      selectedPoolCalculation: undefined,

      pools: mocks.mockedPools1,
      calculations: mocks.mockedOrderCalculations1,
      bestPoolCalculation: mocks.mockedOrderCalculations1[0],
    },
  }
  it('unknown', () => {
    const action = {type: 'UNKNOWN'} as any
    const state = combinedSwapReducers(mockSwapStateDefault, action)
    expect(state).toEqual(mockSwapStateDefault)
  })

  describe('OrderTypeChanged', () => {
    it('change to limit', () => {
      const stateTypeChanged: SwapState = {
        ...mockSwapStateDefault,
        orderData: {
          ...mockSwapStateDefault.orderData,
          amounts: {
            sell: {
              quantity: '10000',
              tokenId: 'tokenA',
            },
            buy: {
              quantity: '0',
              tokenId: 'tokenB',
            },
          },
          limitPrice: undefined,
          slippage: 0,
          type: 'market',
          selectedPoolId: undefined,
          selectedPoolCalculation: undefined,

          pools: [],
          calculations: [],
          bestPoolCalculation: undefined,
        },
      }

      const action: SwapCreateOrderAction = {
        type: SwapCreateOrderActionType.OrderTypeChanged,
        orderType: 'limit',
      }
      const expectedState = produce(stateTypeChanged, (draft) => {
        draft.orderData.type = 'limit'
      })
      const state = combinedSwapReducers(expectedState, action)
      expect(state).toEqual(expectedState)
    })

    it('change to limit and back to market', () => {
      const stateTypeChanged: SwapState = {
        ...mockSwapStateDefault,
        orderData: {
          ...mockSwapStateDefault.orderData,
          amounts: {
            sell: {
              quantity: '100',
              tokenId: 'tokenA',
            },
            buy: {
              quantity: '0',
              tokenId: 'tokenB',
            },
          },
          limitPrice: undefined,
          slippage: 0,
          type: 'market',
          selectedPoolId: undefined,
          selectedPoolCalculation: undefined,

          pools: [],
          calculations: [],
          bestPoolCalculation: undefined,
        },
      }
      const stateAfterPools = combinedSwapReducers(stateTypeChanged, {
        type: SwapCreateOrderActionType.PoolPairsChanged,
        pools: mocks.mockedPools6,
      })

      const actionLimit: SwapCreateOrderAction = {
        type: SwapCreateOrderActionType.OrderTypeChanged,
        orderType: 'limit',
      }

      const state = combinedSwapReducers(stateAfterPools, actionLimit)

      expect(state.orderData.type).toBe('limit')
      expect(state.orderData.limitPrice).toBe('0.5')
      expect(state.orderData.amounts.buy.quantity).toBe('200')

      const actionMarket: SwapCreateOrderAction = {
        type: SwapCreateOrderActionType.OrderTypeChanged,
        orderType: 'market',
      }

      const stateBack = combinedSwapReducers(state, actionMarket)
      expect(stateBack.orderData.type).toBe('market')
    })
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

  describe('SelectedPoolChanged', () => {
    describe('market', () => {
      it('should ignore', () => {
        const action: SwapCreateOrderAction = {
          type: SwapCreateOrderActionType.SelectedPoolChanged,
          poolId: '6',
        }
        const state = combinedSwapReducers(mockedState, action)
        expect(state).toEqual(mockedState)
      })
    })

    describe('limit', () => {
      it('should update pool if avaible and reset limit to market price', () => {
        const initialState = produce(mockSwapStateDefault, (draft) => {
          draft.orderData.amounts.sell.tokenId = 'tokenA'
          draft.orderData.amounts.buy.tokenId = 'tokenB'
          draft.orderData.type = 'limit'
        })
        const updatedPools = combinedSwapReducers(initialState, {
          type: SwapCreateOrderActionType.PoolPairsChanged,
          pools: mocks.mockedPools6,
        })
        const updatedLimit = combinedSwapReducers(updatedPools, {
          type: SwapCreateOrderActionType.LimitPriceChanged,
          limitPrice: '2',
        })

        const state = combinedSwapReducers(updatedLimit, {
          type: SwapCreateOrderActionType.SelectedPoolChanged,
          poolId: '1',
        })

        // change back to market price
        expect(state.orderData.limitPrice).toBe('2')
        expect(state.orderData.selectedPoolId).toBe('1')
      })
    })
  })

  it('SelectedPoolChanged limit (should updated the selected pool)', () => {
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

  // NOTE: switch tokens recalculate based on sell side
  // this cause every switch to update the quantities
  // when switchin tokens on a limit order the quantities may become too big
  // because the limit price is kept
  describe('SwitchTokens', () => {
    it('should change buy / sell and derive the calculation accordingly', () => {
      const initialState = produce(mockSwapStateDefault, (draft) => {
        draft.orderData.amounts.sell.tokenId = 'tokenA'
        draft.orderData.amounts.buy.tokenId = 'tokenB'
      })
      const updatedPools = combinedSwapReducers(initialState, {
        type: SwapCreateOrderActionType.PoolPairsChanged,
        pools: mocks.mockedPools6,
      })

      const state = combinedSwapReducers(updatedPools, {
        type: SwapCreateOrderActionType.SwitchTokens,
      })

      expect(state.orderData.amounts.buy.tokenId).toBe('tokenA')
      expect(state.orderData.amounts.sell.tokenId).toBe('tokenB')
    })
  })

  describe('ResetQuantities (always reset selected pool)', () => {
    it('should reset limit to undefined when order is market', () => {
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

    it('should reset limit to market price when order is limit', () => {
      const initialState = produce(mockSwapStateDefault, (draft) => {
        draft.orderData.amounts.sell.tokenId = 'tokenA'
        draft.orderData.amounts.buy.tokenId = 'tokenB'
        draft.orderData.type = 'limit'
      })
      const updatedPools = combinedSwapReducers(initialState, {
        type: SwapCreateOrderActionType.PoolPairsChanged,
        pools: mocks.mockedPools6,
      })
      const updatedLimit = combinedSwapReducers(updatedPools, {
        type: SwapCreateOrderActionType.LimitPriceChanged,
        limitPrice: '0.5',
      })

      const state = combinedSwapReducers(updatedLimit, {
        type: SwapCreateOrderActionType.ResetQuantities,
      })

      // change back to market price
      expect(state.orderData.limitPrice).toBe('2')
    })
  })

  describe('LimitPriceChanged', () => {
    it('should not update when order type is market', () => {
      const action: SwapCreateOrderAction = {
        type: SwapCreateOrderActionType.LimitPriceChanged,
        limitPrice: '2',
      }
      const state = combinedSwapReducers(mockSwapStateDefault, action)
      expect(state.orderData.limitPrice).toBe(
        mockSwapStateDefault.orderData.limitPrice,
      )
    })

    it('should update the limit and the buy side when pools are available', () => {
      const initialState = produce(mockSwapStateDefault, (draft) => {
        draft.orderData.amounts.sell.tokenId = 'tokenA'
        draft.orderData.amounts.buy.tokenId = 'tokenB'
        draft.orderData.type = 'limit'
      })
      const updatedPools = combinedSwapReducers(initialState, {
        type: SwapCreateOrderActionType.PoolPairsChanged,
        pools: [],
      })

      const state = combinedSwapReducers(updatedPools, {
        type: SwapCreateOrderActionType.LimitPriceChanged,
        limitPrice: '2',
      })

      expect(state.orderData.limitPrice).toBe('2')
    })
  })

  describe('SellTokenInfoChanged', () => {
    it('should reset pools and the derived data', () => {
      const initialState = produce(mockSwapStateDefault, (draft) => {
        draft.orderData.amounts.sell.tokenId = 'tokenA'
        draft.orderData.amounts.buy.tokenId = 'tokenB'
        draft.orderData.tokens = {
          sellInfo: {
            id: 'tokenA',
            decimals: 6,
          },
          buyInfo: {
            id: 'tokenB',
            decimals: 6,
          },
          ptInfo: {
            id: '',
            decimals: 6,
          },
          priceDenomination: 0,
        }
      })
      const updatedPools = combinedSwapReducers(initialState, {
        type: SwapCreateOrderActionType.PoolPairsChanged,
        pools: mocks.mockedPools1,
      })
      const updatedSellQuantity = combinedSwapReducers(updatedPools, {
        type: SwapCreateOrderActionType.SellQuantityChanged,
        quantity: '10000',
      })

      const state = combinedSwapReducers(updatedSellQuantity, {
        type: SwapCreateOrderActionType.SellTokenInfoChanged,
        tokenInfo: {
          id: 'x',
          decimals: 6,
        },
      })

      expect(state.orderData.amounts.sell.tokenId).toBe('x')
      // should be updated right next with the new pool pairs
      expect(state.orderData.pools).toEqual([])
      // should reset everything derived
      expect(state.orderData.calculations).toEqual([])
      expect(state.orderData.selectedPoolCalculation).toBeUndefined()
      expect(state.orderData.bestPoolCalculation).toBeUndefined()
      // type is irrelevant
      expect(state.orderData.selectedPoolId).toBeUndefined()
    })
  })

  describe('BuyTokenInfoChanged', () => {
    it('should reset pools and the derived data', () => {
      const initialState = produce(mockSwapStateDefault, (draft) => {
        draft.orderData.amounts.sell.tokenId = 'tokenA'
        draft.orderData.amounts.buy.tokenId = 'tokenB'
        draft.orderData.tokens = {
          sellInfo: {
            id: 'tokenA',
            decimals: 6,
          },
          buyInfo: {
            id: 'tokenB',
            decimals: 6,
          },
          ptInfo: {
            id: '',
            decimals: 6,
          },
          priceDenomination: 0,
        }
      })
      const updatedPools = combinedSwapReducers(initialState, {
        type: SwapCreateOrderActionType.PoolPairsChanged,
        pools: mocks.mockedPools1,
      })
      const updatedSellQuantity = combinedSwapReducers(updatedPools, {
        type: SwapCreateOrderActionType.SellQuantityChanged,
        quantity: '10000',
      })

      const state = combinedSwapReducers(updatedSellQuantity, {
        type: SwapCreateOrderActionType.BuyTokenInfoChanged,
        tokenInfo: {
          id: 'x',
          decimals: 6,
        },
      })

      expect(state.orderData.amounts.buy.tokenId).toBe('x')
      // should be updated right next with the new pool pairs
      expect(state.orderData.pools).toEqual([])
      // should reset everything derived
      expect(state.orderData.calculations).toEqual([])
      expect(state.orderData.selectedPoolCalculation).toBeUndefined()
      expect(state.orderData.bestPoolCalculation).toBeUndefined()
      // type is irrelevant
      expect(state.orderData.selectedPoolId).toBeUndefined()
    })
  })

  describe('SellQuantityChanged', () => {
    it('should calculate the buy side if pools are available', () => {
      const initialState = produce(mockSwapStateDefault, (draft) => {
        draft.orderData.amounts.sell.tokenId = 'tokenA'
        draft.orderData.amounts.buy.tokenId = 'tokenB'
      })
      const updatedPools = combinedSwapReducers(initialState, {
        type: SwapCreateOrderActionType.PoolPairsChanged,
        pools: mocks.mockedPools1,
      })

      const state = combinedSwapReducers(updatedPools, {
        type: SwapCreateOrderActionType.SellQuantityChanged,
        quantity: '10',
      })

      expect(state.orderData.selectedPoolCalculation).toBeDefined()
      expect(state.orderData.amounts.buy.quantity).toBe('124')
      expect(state.orderData.amounts.sell.quantity).toBe('10')
    })
  })

  describe('BuyQuantityChanged', () => {
    it('should calculate the buy side if pools are available', () => {
      const initialState = produce(mockSwapStateDefault, (draft) => {
        draft.orderData.amounts.sell.tokenId = 'tokenA'
        draft.orderData.amounts.buy.tokenId = 'tokenB'
      })
      const updatedPools = combinedSwapReducers(initialState, {
        type: SwapCreateOrderActionType.PoolPairsChanged,
        pools: mocks.mockedPools1,
      })

      const state = combinedSwapReducers(updatedPools, {
        type: SwapCreateOrderActionType.BuyQuantityChanged,
        quantity: '1',
      })

      expect(state.orderData.selectedPoolCalculation).toBeDefined()
      expect(state.orderData.amounts.buy.quantity).toBe('1')
      expect(state.orderData.amounts.sell.quantity).toBe('3')
    })
  })

  // NOTE an important assumption is taken when calculating the best pool
  // that all poolpairs (pools) object are tokenA/tokenB represents buy/sell sell/buy
  // and that the UI will never allow buy and sell tokens to be the same after touched
  describe('PoolPairsChanged', () => {
    describe('limit order', () => {
      it('should reset limit price to market and unselect the selected pool', () => {
        const initialState = produce(mockSwapStateDefault, (draft) => {
          draft.orderData.amounts.sell.tokenId = 'tokenA'
          draft.orderData.amounts.buy.tokenId = 'tokenB'
        })
        const updatedPools = combinedSwapReducers(initialState, {
          type: SwapCreateOrderActionType.PoolPairsChanged,
          pools: mocks.mockedPools1,
        })
        const updatedSellQuantity = combinedSwapReducers(updatedPools, {
          type: SwapCreateOrderActionType.SellQuantityChanged,
          quantity: '100',
        })
        const updatedType = combinedSwapReducers(updatedSellQuantity, {
          type: SwapCreateOrderActionType.OrderTypeChanged,
          orderType: 'limit',
        })
        const updatedLimit = combinedSwapReducers(updatedType, {
          type: SwapCreateOrderActionType.LimitPriceChanged,
          limitPrice: '1',
        })

        const state = combinedSwapReducers(updatedLimit, {
          type: SwapCreateOrderActionType.PoolPairsChanged,
          pools: mocks.mockedPools6,
        })

        expect(state.orderData.limitPrice).toBe('0.5')
        expect(state.orderData.selectedPoolId).toBeUndefined()
      })
    })

    describe('no pools', () => {
      it('should leave limit price undefined and wont update the buy side', () => {
        const initialState = produce(mockSwapStateDefault, (draft) => {
          draft.orderData.amounts.sell.tokenId = 'tokenA'
          draft.orderData.amounts.buy.tokenId = 'tokenB'
        })
        const updatedPools = combinedSwapReducers(initialState, {
          type: SwapCreateOrderActionType.PoolPairsChanged,
          pools: mocks.mockedPools1,
        })
        const updatedSellQuantity = combinedSwapReducers(updatedPools, {
          type: SwapCreateOrderActionType.SellQuantityChanged,
          quantity: '10000',
        })
        const updatedType = combinedSwapReducers(updatedSellQuantity, {
          type: SwapCreateOrderActionType.OrderTypeChanged,
          orderType: 'limit',
        })
        const updatedLimit = combinedSwapReducers(updatedType, {
          type: SwapCreateOrderActionType.LimitPriceChanged,
          limitPrice: '1',
        })

        // this would happen when changing the tokenId of one sides
        // and there is no pool pairs for the new pair
        const state = combinedSwapReducers(updatedLimit, {
          type: SwapCreateOrderActionType.PoolPairsChanged,
          pools: [],
        })

        expect(state.orderData.limitPrice).toBeUndefined()
        expect(state.orderData.selectedPoolId).toBeUndefined()
        expect(state.orderData.amounts.buy.quantity).toBe(
          updatedLimit.orderData.amounts.buy.quantity,
        )
      })
    })
  })

  // NOTE: initialized only
  // designed to be triggered once only
  it('PrimaryTokenInfoChanged', () => {
    const expectedState = combinedSwapReducers(mockSwapStateDefault, {
      type: SwapCreateOrderActionType.PrimaryTokenInfoChanged,
      tokenInfo: {
        id: 'brand.new',
        decimals: 6,
      },
    })
    expect(expectedState.orderData.tokens.ptInfo.id).toBe('brand.new')
    expect(expectedState.orderData.tokens.ptInfo.decimals).toBe(6)
  })

  it('LpTokenHeldChanged', () => {
    const initialState = produce(mockSwapStateDefault, (draft) => {
      draft.orderData.amounts.sell.tokenId = 'tokenA'
      draft.orderData.amounts.buy.tokenId = 'tokenB'
    })
    const updatedPools = combinedSwapReducers(initialState, {
      type: SwapCreateOrderActionType.PoolPairsChanged,
      pools: mocks.mockedPools6,
    })
    const updatedSellQuantity = combinedSwapReducers(updatedPools, {
      type: SwapCreateOrderActionType.SellQuantityChanged,
      quantity: '10000',
    })

    const state = combinedSwapReducers(updatedSellQuantity, {
      type: SwapCreateOrderActionType.LpTokenHeldChanged,
      amount: {
        quantity: '100',
        tokenId: 'lp.token',
      },
    })

    expect(state.orderData.amounts.buy.quantity).toBe(
      updatedSellQuantity.orderData.amounts.buy.quantity,
    )
  })

  // NOTE: initialized only
  // designed to be triggered once only
  it('FrontendFeeTiersChanged', () => {
    const initialState = produce(mockSwapStateDefault, (draft) => {
      draft.orderData.amounts.sell.tokenId = 'tokenA'
      draft.orderData.amounts.buy.tokenId = 'tokenB'
    })
    const updatedPools = combinedSwapReducers(initialState, {
      type: SwapCreateOrderActionType.PoolPairsChanged,
      pools: mocks.mockedPools6,
    })
    const updatedSellQuantity = combinedSwapReducers(updatedPools, {
      type: SwapCreateOrderActionType.SellQuantityChanged,
      quantity: '10000',
    })

    const state = combinedSwapReducers(updatedSellQuantity, {
      type: SwapCreateOrderActionType.FrontendFeeTiersChanged,
      feeTiers: [],
    })

    expect(state.orderData.amounts.buy.quantity).toBe(
      updatedSellQuantity.orderData.amounts.buy.quantity,
    )
  })
})
