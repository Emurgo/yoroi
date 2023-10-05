import * as React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'
import {renderHook, act} from '@testing-library/react-hooks'

import {SwapProvider} from './SwapProvider'
import {mockSwapManager, swapManagerMocks} from '../../../manager.mocks'
import {SwapState, defaultSwapState} from '../state/state'
import {queryClientFixture} from '../../../fixtures/query-client'
import {useSwap} from '../hooks/useSwap'

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

  it('LimitPriceChanged', () => {
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

    expect(result.current.orderData.limitPrice).toBe('3')
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
})
