import * as React from 'react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {renderHook, act} from '@testing-library/react-hooks'
import {AppApi} from '@yoroi/api'

import {SwapProvider} from './SwapProvider'
import {mockSwapManager, swapManagerMocks} from '../../../manager.mocks'
import {SwapState, defaultSwapState} from '../state/state'
import {queryClientFixture} from '../../../fixtures/query-client'
import {useSwap} from '../hooks/useSwap'
import {mocks} from '../../../helpers/mocks'

describe('SwapProvider', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('OrderTypeChanged', () => {
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager}>{children}</SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.orderTypeChanged('limit')
    })

    expect(result.current.orderData.type).toBe('limit')
  })

  it('SelectedPoolChanged', () => {
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager}>{children}</SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.selectedPoolChanged(
        swapManagerMocks.listPoolsByPairResponse[0]?.poolId!,
      )
    })

    // initial state = market order
    expect(result.current.orderData.selectedPoolId).toBeUndefined()

    act(() => {
      result.current.orderTypeChanged('limit')
    })

    act(() => {
      result.current.selectedPoolChanged(
        swapManagerMocks.listPoolsByPairResponse[0]?.poolId!,
      )
    })

    expect(result.current.orderData.selectedPoolId).toEqual(
      swapManagerMocks.listPoolsByPairResponse[0]?.poolId,
    )
  })

  it('SlippageChanged', () => {
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager}>{children}</SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.slippageChanged(3)
    })

    expect(result.current.orderData.slippage).toBe(3)
  })

  it('UnsignedTxChanged', () => {
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager}>{children}</SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.unsignedTxChanged({
        hash: 'hash',
      })
    })

    expect(result.current.unsignedTx).toEqual({hash: 'hash'})
  })

  describe('LimitPriceChanged', () => {
    it('should not update limit price if order type is market', () => {
      const wrapper = ({children}: any) => (
        <QueryClientProvider client={queryClient}>
          <SwapProvider swapManager={mockSwapManager}>{children}</SwapProvider>
        </QueryClientProvider>
      )

      const {result} = renderHook(() => useSwap(), {
        wrapper,
      })

      act(() => {
        result.current.limitPriceChanged('3')
      })

      expect(result.current.orderData.limitPrice).toBeUndefined()
    })

    it('should update limit price if order type is market', () => {
      const wrapper = ({children}: any) => (
        <QueryClientProvider client={queryClient}>
          <SwapProvider swapManager={mockSwapManager}>{children}</SwapProvider>
        </QueryClientProvider>
      )

      const {result} = renderHook(() => useSwap(), {
        wrapper,
      })

      act(() => {
        result.current.orderTypeChanged('limit')
        result.current.limitPriceChanged('3')
      })

      expect(result.current.orderData.limitPrice).toBe('3')
    })
  })

  it('SwitchTokens market', () => {
    const initialState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
        amounts: {
          sell: {
            quantity: '10',
            tokenId: 'policyId.sell',
          },
          buy: {
            quantity: '20',
            tokenId: 'policyId.buy',
          },
        },
      },
      unsignedTx: undefined,
    }
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager} initialState={initialState}>
          {children}
        </SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.switchTokens()
    })

    expect(result.current.orderData.amounts).toEqual({
      sell: {
        quantity: '20',
        tokenId: 'policyId.buy',
      },
      buy: {
        quantity: '10',
        tokenId: 'policyId.sell',
      },
    })
  })

  it('SwitchTokens limit', () => {
    const initialState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
        type: 'limit',
        limitPrice: '2',
        amounts: {
          sell: {
            quantity: '10',
            tokenId: 'policyId.sell',
          },
          buy: {
            quantity: '20',
            tokenId: 'policyId.buy',
          },
        },
      },
      unsignedTx: undefined,
    }
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager} initialState={initialState}>
          {children}
        </SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.switchTokens()
    })

    expect(result.current.orderData.amounts).toEqual({
      sell: {
        quantity: '20',
        tokenId: 'policyId.buy',
      },
      buy: {
        quantity: '10',
        tokenId: 'policyId.sell',
      },
    })

    act(() => {
      result.current.switchTokens()
    })

    expect(result.current.orderData.amounts).toEqual({
      sell: {
        quantity: '10',
        tokenId: 'policyId.sell',
      },
      buy: {
        quantity: '20',
        tokenId: 'policyId.buy',
      },
    })
  })

  it('ResetQuantities', () => {
    const initiState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
        amounts: {
          sell: {
            quantity: '1',
            tokenId: 'policyId.sell',
          },
          buy: {
            quantity: '2',
            tokenId: 'policyId.buy',
          },
        },
        limitPrice: '3',
      },
      unsignedTx: undefined,
    }
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager} initialState={initiState}>
          {children}
        </SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.resetQuantities()
    })

    expect(result.current.orderData.amounts).toEqual({
      sell: {
        quantity: '0',
        tokenId: 'policyId.sell',
      },
      buy: {
        quantity: '0',
        tokenId: 'policyId.buy',
      },
    })
    expect(result.current.orderData.limitPrice).toEqual(undefined)
  })

  it('ResetState', () => {
    const initialState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
        amounts: {
          sell: {
            quantity: '1',
            tokenId: 'policyId.sell',
          },
          buy: {
            quantity: '2',
            tokenId: 'policyId.buy',
          },
        },
      },
      unsignedTx: undefined,
    }
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager} initialState={initialState}>
          {children}
        </SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.resetState()
    })

    expect(result.current.orderData).toEqual(defaultSwapState.orderData)
    expect(result.current.unsignedTx).toBeUndefined()
  })

  it('BuyQuantityChanged', () => {
    const initialState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
        amounts: {
          sell: {
            quantity: '10',
            tokenId: 'policyId.sell',
          },
          buy: {
            quantity: '20',
            tokenId: 'policyId.buy',
          },
        },
      },
      unsignedTx: undefined,
    }
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager} initialState={initialState}>
          {children}
        </SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.buyQuantityChanged('30')
    })

    expect(result.current.orderData.amounts).toEqual({
      sell: {
        quantity: '10',
        tokenId: 'policyId.sell',
      },
      buy: {
        quantity: '30',
        tokenId: 'policyId.buy',
      },
    })
  })

  it('SellQuantityChanged', () => {
    const initialState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
        amounts: {
          sell: {
            quantity: '10',
            tokenId: 'policyId.sell',
          },
          buy: {
            quantity: '20',
            tokenId: 'policyId.buy',
          },
        },
      },
      unsignedTx: undefined,
    }
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager} initialState={initialState}>
          {children}
        </SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.sellQuantityChanged('30')
    })

    expect(result.current.orderData.amounts).toEqual({
      sell: {
        quantity: '30',
        tokenId: 'policyId.sell',
      },
      buy: {
        quantity: '20',
        tokenId: 'policyId.buy',
      },
    })
  })

  it('LpTokenHeldChanged', () => {
    const initialState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
        lpTokenHeld: undefined,
      },
      unsignedTx: undefined,
    }
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager} initialState={initialState}>
          {children}
        </SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.lpTokenHeldChanged({
        quantity: '30',
        tokenId: 'policyId.tokenHeld',
      })
    })

    expect(result.current.orderData.lpTokenHeld).toEqual({
      quantity: '30',
      tokenId: 'policyId.tokenHeld',
    })
  })

  it('BuyTokenInfoChanged', () => {
    const initialState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
        amounts: {
          sell: {
            quantity: '10',
            tokenId: 'policyId.sell',
          },
          buy: {
            quantity: '20',
            tokenId: 'policyId.buy',
          },
        },
        tokens: {
          sellInfo: {
            decimals: 6,
            id: 'policyId.sell',
          },
          buyInfo: {
            decimals: 6,
            id: 'policyId.buy',
          },
          ptInfo: {
            decimals: 6,
            id: '',
          },
          priceDenomination: 0,
        },
      },
      unsignedTx: undefined,
    }
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager} initialState={initialState}>
          {children}
        </SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.buyTokenInfoChanged({
        decimals: 4,
        id: 'new.token',
      })
    })

    expect(result.current.orderData.amounts.buy).toEqual({
      quantity: '20',
      tokenId: 'new.token',
    })
    expect(result.current.orderData.tokens.buyInfo).toEqual({
      decimals: 4,
      id: 'new.token',
    })
    expect(result.current.orderData.tokens.priceDenomination).toBe(2)
  })

  it('SellTokenInfoChanged', () => {
    const initialState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
        amounts: {
          sell: {
            quantity: '1000000',
            tokenId: 'policyId.sell',
          },
          buy: {
            quantity: '20',
            tokenId: 'policyId.buy',
          },
        },
        tokens: {
          sellInfo: {
            decimals: 6,
            id: 'policyId.sell',
          },
          buyInfo: {
            decimals: 6,
            id: 'policyId.buy',
          },
          ptInfo: {
            decimals: 6,
            id: '',
          },
          priceDenomination: 0,
        },
      },
      unsignedTx: undefined,
    }
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager} initialState={initialState}>
          {children}
        </SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.sellTokenInfoChanged({
        decimals: 4,
        id: 'new.token',
      })
    })

    expect(result.current.orderData.amounts.sell).toEqual({
      quantity: '10000',
      tokenId: 'new.token',
    })
    expect(result.current.orderData.tokens.sellInfo).toEqual({
      decimals: 4,
      id: 'new.token',
    })
    expect(result.current.orderData.tokens.priceDenomination).toBe(-2)
  })

  it('PoolPairsChanged', () => {
    const initialState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
      },
      unsignedTx: undefined,
    }
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager} initialState={initialState}>
          {children}
        </SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.poolPairsChanged(mocks.mockedPools1)
    })

    expect(result.current.orderData.pools).toEqual(mocks.mockedPools1)
  })

  it('PrimaryTokenIdChanged', () => {
    const initialState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
      },
      unsignedTx: undefined,
    }
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager} initialState={initialState}>
          {children}
        </SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.primaryTokenInfoChanged({
        decimals: 6,
        id: 'primary.tokenId',
      })
    })

    expect(result.current.orderData.tokens.ptInfo).toEqual({
      decimals: 6,
      id: 'primary.tokenId',
    })
  })

  it('FrontendFeeTiersChanged', () => {
    const initialState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
      },
      unsignedTx: undefined,
    }
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager} initialState={initialState}>
          {children}
        </SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.frontendFeeTiersChanged(
        AppApi.mockGetFrontendFees.withFees.muesliswap!,
      )
    })

    expect(result.current.orderData.frontendFeeTiers).toEqual(
      AppApi.mockGetFrontendFees.withFees.muesliswap!,
    )
  })
})
