import {produce} from 'immer'
import {Portfolio} from '@yoroi/types'

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
import {tokenInfoMocks} from '../../../tokenInfo.mocks'

// NOTE: the calculations are tested on the factories
// here is just testing the state behaviour
describe('State Actions', () => {
  const mockedState: SwapState = {
    ...mockSwapStateDefault,
    orderData: {
      ...mockSwapStateDefault.orderData,
      amounts: {
        sell: {
          quantity: 100000000n,
          info: tokenInfoMocks.a,
        },
        buy: {
          quantity: 1401162647n,
          info: tokenInfoMocks.b,
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
              quantity: 10000n,
              info: tokenInfoMocks.a,
            },
            buy: {
              info: tokenInfoMocks.b,
              quantity: 0n,
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
              info: tokenInfoMocks.a,
              quantity: 100n,
            },
            buy: {
              info: tokenInfoMocks.b,
              quantity: 0n,
            },
          },
          tokens: {
            priceDenomination: 0,
            ptInfo: tokenInfoMocks.pt,
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
      expect(state.orderData.amounts.buy?.quantity).toBe(200n)

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
          draft.orderData.amounts.sell = {
            info: tokenInfoMocks.a,
            quantity: 0n,
          }
          draft.orderData.amounts.buy = {
            info: tokenInfoMocks.b,
            quantity: 0n,
          }
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
        draft.orderData.amounts.sell = {
          info: tokenInfoMocks.a,
          quantity: 0n,
        }
        draft.orderData.amounts.buy = {
          info: tokenInfoMocks.b,
          quantity: 0n,
        }
      })
      const updatedPools = combinedSwapReducers(initialState, {
        type: SwapCreateOrderActionType.PoolPairsChanged,
        pools: mocks.mockedPools6,
      })

      const state = combinedSwapReducers(updatedPools, {
        type: SwapCreateOrderActionType.SwitchTokens,
      })

      expect(state.orderData.amounts.buy?.info.id).toBe('tokenA.')
      expect(state.orderData.amounts.sell?.info.id).toBe('tokenB.')
    })
  })

  describe('ResetQuantities (always reset selected pool)', () => {
    it('should reset limit to undefined when order is market', () => {
      const action: SwapCreateOrderAction = {
        type: SwapCreateOrderActionType.ResetQuantities,
      }
      const expectedState = produce(mockSwapStateDefault, (draft) => {
        if (draft.orderData.amounts.sell)
          draft.orderData.amounts.sell.quantity = 0n
        if (draft.orderData.amounts.buy)
          draft.orderData.amounts.buy.quantity = 0n
        draft.orderData.limitPrice = undefined
      })
      const state = combinedSwapReducers(mockSwapStateDefault, action)
      expect(state).toEqual(expectedState)
    })

    it('should reset limit to market price when order is limit', () => {
      const initialState = produce(mockSwapStateDefault, (draft) => {
        draft.orderData.amounts.sell = {
          info: tokenInfoMocks.a,
          quantity: 0n,
        }
        draft.orderData.amounts.buy = {
          info: tokenInfoMocks.b,
          quantity: 0n,
        }
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
        draft.orderData.amounts.sell = {
          info: tokenInfoMocks.a,
          quantity: 0n,
        }
        draft.orderData.amounts.buy = {
          info: tokenInfoMocks.b,
          quantity: 0n,
        }
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
        draft.orderData.amounts.sell = {
          info: tokenInfoMocks.a,
          quantity: 0n,
        }
        draft.orderData.amounts.buy = {
          info: tokenInfoMocks.b,
          quantity: 0n,
        }
        draft.orderData.tokens = {
          sellInfo: tokenInfoMocks.a,
          buyInfo: tokenInfoMocks.b,
          ptInfo: tokenInfoMocks.pt,
          priceDenomination: 0,
        }
      })
      const updatedPools = combinedSwapReducers(initialState, {
        type: SwapCreateOrderActionType.PoolPairsChanged,
        pools: mocks.mockedPools1,
      })
      const updatedSellQuantity = combinedSwapReducers(updatedPools, {
        type: SwapCreateOrderActionType.SellQuantityChanged,
        quantity: 10_000n,
      })

      const state = combinedSwapReducers(updatedSellQuantity, {
        type: SwapCreateOrderActionType.SellTokenInfoChanged,
        tokenInfo: tokenInfoMocks.lp,
      })

      expect(state.orderData.amounts.sell!).toEqual<Portfolio.Token.Amount>({
        quantity: 10_000n,
        info: tokenInfoMocks.lp,
      })
      // should be updated right next with the new pool pairs
      expect(state.orderData.pools).toEqual([])
      // should reset everything derived
      expect(state.orderData.calculations).toEqual([])
      expect(state.orderData.selectedPoolCalculation).toBeUndefined()
      expect(state.orderData.bestPoolCalculation).toBeUndefined()
      // type is irrelevant
      expect(state.orderData.selectedPoolId).toBeUndefined()
    })

    it('should initiate sell side', () => {
      const state = combinedSwapReducers(mockSwapStateDefault, {
        type: SwapCreateOrderActionType.SellTokenInfoChanged,
        tokenInfo: tokenInfoMocks.lp,
      })
      expect(state.orderData.amounts.sell).toEqual<Portfolio.Token.Amount>({
        quantity: 0n,
        info: tokenInfoMocks.lp,
      })
    })
  })

  describe('BuyTokenInfoChanged', () => {
    it('should reset pools and the derived', () => {
      const initialState = produce(mockSwapStateDefault, (draft) => {
        draft.orderData.amounts.sell = {
          info: tokenInfoMocks.a,
          quantity: 0n,
        }
        draft.orderData.amounts.buy = {
          info: tokenInfoMocks.b,
          quantity: 0n,
        }
        draft.orderData.tokens = {
          sellInfo: tokenInfoMocks.a,
          buyInfo: tokenInfoMocks.b,
          ptInfo: tokenInfoMocks.pt,
          priceDenomination: 0,
        }
      })
      const updatedPools = combinedSwapReducers(initialState, {
        type: SwapCreateOrderActionType.PoolPairsChanged,
        pools: mocks.mockedPools1,
      })
      const updatedSellQuantity = combinedSwapReducers(updatedPools, {
        type: SwapCreateOrderActionType.SellQuantityChanged,
        quantity: 10_000n,
      })

      expect(
        updatedSellQuantity.orderData.amounts.buy,
      ).toEqual<Portfolio.Token.Amount>({
        info: tokenInfoMocks.b,
        quantity: 138_194n,
      })

      const state = combinedSwapReducers(updatedSellQuantity, {
        type: SwapCreateOrderActionType.BuyTokenInfoChanged,
        tokenInfo: tokenInfoMocks.c,
      })

      expect(state.orderData.amounts.buy).toEqual<Portfolio.Token.Amount>({
        quantity: 138_194n,
        info: tokenInfoMocks.c,
      })
      // should be updated right next with the new pool pairs
      expect(state.orderData.pools).toEqual([])
      // should reset everything derived
      expect(state.orderData.calculations).toEqual([])
      expect(state.orderData.selectedPoolCalculation).toBeUndefined()
      expect(state.orderData.bestPoolCalculation).toBeUndefined()
      // type is irrelevant
      expect(state.orderData.selectedPoolId).toBeUndefined()
    })

    it('should initiate buy side', () => {
      const state = combinedSwapReducers(mockSwapStateDefault, {
        type: SwapCreateOrderActionType.BuyTokenInfoChanged,
        tokenInfo: tokenInfoMocks.lp,
      })
      expect(state.orderData.amounts.buy).toEqual<Portfolio.Token.Amount>({
        quantity: 0n,
        info: tokenInfoMocks.lp,
      })
    })
  })

  describe('SellQuantityChanged', () => {
    it('should calculate the buy side if pools are available', () => {
      const initialState = produce(mockSwapStateDefault, (draft) => {
        draft.orderData.amounts.sell = {
          info: tokenInfoMocks.a,
          quantity: 0n,
        }
        draft.orderData.amounts.buy = {
          info: tokenInfoMocks.b,
          quantity: 0n,
        }
      })
      const updatedPools = combinedSwapReducers(initialState, {
        type: SwapCreateOrderActionType.PoolPairsChanged,
        pools: mocks.mockedPools1,
      })

      const state = combinedSwapReducers(updatedPools, {
        type: SwapCreateOrderActionType.SellQuantityChanged,
        quantity: 10n,
      })

      expect(state.orderData.selectedPoolCalculation).toBeDefined()
      expect(state.orderData.amounts.buy!.quantity).toBe(124n)
      expect(state.orderData.amounts.sell!.quantity).toBe(10n)
    })

    it('should skip updates if sell quantity changes but no sell token info', () => {
      const state = combinedSwapReducers(mockSwapStateDefault, {
        type: SwapCreateOrderActionType.SellQuantityChanged,
        quantity: 10n,
      })

      expect(state).toEqual(mockSwapStateDefault)
    })
  })

  describe('BuyQuantityChanged', () => {
    it('should calculate the buy side if pools are available', () => {
      const initialState = produce(mockSwapStateDefault, (draft) => {
        draft.orderData.amounts.sell = {
          info: tokenInfoMocks.a,
          quantity: 0n,
        }
        draft.orderData.amounts.buy = {
          info: tokenInfoMocks.b,
          quantity: 0n,
        }
      })
      const updatedPools = combinedSwapReducers(initialState, {
        type: SwapCreateOrderActionType.PoolPairsChanged,
        pools: mocks.mockedPools1,
      })

      const state = combinedSwapReducers(updatedPools, {
        type: SwapCreateOrderActionType.BuyQuantityChanged,
        quantity: 1n,
      })

      expect(state.orderData.selectedPoolCalculation).toBeDefined()
      expect(state.orderData.amounts.buy!.quantity).toBe(1n)
      expect(state.orderData.amounts.sell!.quantity).toBe(3n)
    })

    it('should skip updates if buy quantity changes but no buy token info', () => {
      const state = combinedSwapReducers(mockSwapStateDefault, {
        type: SwapCreateOrderActionType.BuyQuantityChanged,
        quantity: 10n,
      })

      expect(state).toEqual(mockSwapStateDefault)
    })
  })

  // NOTE an important assumption is taken when calculating the best pool
  // that all poolpairs (pools) object are tokenA/tokenB represents buy/sell sell/buy
  // and that the UI will never allow buy and sell tokens to be the same after touched
  describe('PoolPairsChanged', () => {
    describe('limit order', () => {
      it('should reset limit price to market and unselect the selected pool', () => {
        const initialState = produce(mockSwapStateDefault, (draft) => {
          draft.orderData.amounts.sell = {
            info: tokenInfoMocks.a,
            quantity: 0n,
          }
          draft.orderData.amounts.buy = {
            info: tokenInfoMocks.b,
            quantity: 0n,
          }
        })
        const updatedPools = combinedSwapReducers(initialState, {
          type: SwapCreateOrderActionType.PoolPairsChanged,
          pools: mocks.mockedPools1,
        })
        const updatedSellQuantity = combinedSwapReducers(updatedPools, {
          type: SwapCreateOrderActionType.SellQuantityChanged,
          quantity: 100n,
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
          draft.orderData.amounts.sell = {
            info: tokenInfoMocks.a,
            quantity: 0n,
          }
          draft.orderData.amounts.buy = {
            info: tokenInfoMocks.b,
            quantity: 0n,
          }
        })
        const updatedPools = combinedSwapReducers(initialState, {
          type: SwapCreateOrderActionType.PoolPairsChanged,
          pools: mocks.mockedPools1,
        })
        const updatedSellQuantity = combinedSwapReducers(updatedPools, {
          type: SwapCreateOrderActionType.SellQuantityChanged,
          quantity: 10_000n,
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
        expect(state.orderData.amounts.buy!.quantity).toBe(
          updatedLimit.orderData.amounts.buy!.quantity,
        )
      })
    })
  })

  // NOTE: initialized only
  // designed to be triggered once only
  it('PrimaryTokenInfoChanged', () => {
    const expectedState = combinedSwapReducers(mockSwapStateDefault, {
      type: SwapCreateOrderActionType.PrimaryTokenInfoChanged,
      tokenInfo: tokenInfoMocks.pt,
    })
    expect(expectedState.orderData.tokens.ptInfo).toEqual(tokenInfoMocks.pt)
  })

  it('LpTokenHeldChanged', () => {
    const initialState = produce(mockSwapStateDefault, (draft) => {
      draft.orderData.amounts.sell = {
        info: tokenInfoMocks.a,
        quantity: 0n,
      }
      draft.orderData.amounts.buy = {
        info: tokenInfoMocks.b,
        quantity: 0n,
      }
    })
    const updatedPools = combinedSwapReducers(initialState, {
      type: SwapCreateOrderActionType.PoolPairsChanged,
      pools: mocks.mockedPools6,
    })
    const updatedSellQuantity = combinedSwapReducers(updatedPools, {
      type: SwapCreateOrderActionType.SellQuantityChanged,
      quantity: 10_000n,
    })

    const state = combinedSwapReducers(updatedSellQuantity, {
      type: SwapCreateOrderActionType.LpTokenHeldChanged,
      amount: {
        quantity: 100n,
        info: tokenInfoMocks.lp,
      },
    })

    expect(state.orderData.lpTokenHeld).toEqual<Portfolio.Token.Amount>({
      quantity: 100n,
      info: tokenInfoMocks.lp,
    })
  })

  // NOTE: initialized only
  // designed to be triggered once only
  it('FrontendFeeTiersChanged', () => {
    const initialState = produce(mockSwapStateDefault, (draft) => {
      draft.orderData.amounts.sell = {
        info: tokenInfoMocks.a,
        quantity: 0n,
      }
      draft.orderData.amounts.buy = {
        info: tokenInfoMocks.b,
        quantity: 0n,
      }
    })
    const updatedPools = combinedSwapReducers(initialState, {
      type: SwapCreateOrderActionType.PoolPairsChanged,
      pools: mocks.mockedPools6,
    })
    const updatedSellQuantity = combinedSwapReducers(updatedPools, {
      type: SwapCreateOrderActionType.SellQuantityChanged,
      quantity: 10_000n,
    })

    const state = combinedSwapReducers(updatedSellQuantity, {
      type: SwapCreateOrderActionType.FrontendFeeTiersChanged,
      feeTiers: [],
    })

    expect(state.orderData.frontendFeeTiers).toEqual([])
  })
})
