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

    expect(result.current.createOrder.type).toBe('limit')
  })

  it('SellAmountChanged', () => {
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager}>{children}</SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.sellAmountChanged({
        quantity: '1',
        tokenId: 'policyId.assetName',
      })
    })

    expect(result.current.createOrder.amounts.sell.quantity).toBe('1')
    expect(result.current.createOrder.amounts.sell.tokenId).toBe(
      'policyId.assetName',
    )
  })

  it('BuyAmountChanged', () => {
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager}>{children}</SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.buyAmountChanged({
        quantity: '2',
        tokenId: 'policyId.assetName',
      })
    })

    expect(result.current.createOrder.amounts.buy.quantity).toBe('2')
    expect(result.current.createOrder.amounts.buy.tokenId).toBe(
      'policyId.assetName',
    )
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
        swapManagerMocks.listPoolsByPairResponse[0]!,
      )
    })

    expect(result.current.createOrder.selectedPool).toEqual(
      swapManagerMocks.listPoolsByPairResponse[0],
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

    expect(result.current.createOrder.slippage).toBe(3)
  })

  it('TxPayloadChanged', () => {
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <SwapProvider swapManager={mockSwapManager}>{children}</SwapProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useSwap(), {
      wrapper,
    })

    act(() => {
      result.current.txPayloadChanged({
        contractAddress: 'contractAddress',
        datum: 'datum',
        datumHash: 'datumHash',
      })
    })

    expect(result.current.createOrder.datum).toBe('datum')
    expect(result.current.createOrder.address).toBe('contractAddress')
    expect(result.current.createOrder.datumHash).toBe('datumHash')
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

    expect(result.current.createOrder.limitPrice).toBe('3')
  })

  it('SwitchTokens market', () => {
    const initialState: SwapState = {
      createOrder: {
        ...defaultSwapState.createOrder,
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
        selectedPool: {
          provider: 'sundaeswap',
          fee: '0.5',
          batcherFee: {tokenId: '', quantity: '1'},
          deposit: {tokenId: '', quantity: '1'},
          lpToken: {tokenId: '', quantity: '1'},
          poolId: '1',
          price: 2,
          tokenA: {tokenId: 'policyId.sell', quantity: '200'},
          tokenB: {tokenId: 'policyId.buy', quantity: '100'},
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

    expect(result.current.createOrder.amounts).toEqual({
      sell: {
        quantity: '8',
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
      createOrder: {
        ...defaultSwapState.createOrder,
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
        selectedPool: {
          provider: 'sundaeswap',
          fee: '0.5',
          batcherFee: {tokenId: '', quantity: '1'},
          deposit: {tokenId: '', quantity: '1'},
          lpToken: {tokenId: '', quantity: '1'},
          poolId: '1',
          price: 2,
          tokenA: {tokenId: 'policyId.sell', quantity: '200'},
          tokenB: {tokenId: 'policyId.buy', quantity: '100'},
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

    expect(result.current.createOrder.amounts).toEqual({
      sell: {
        quantity: '5',
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

    expect(result.current.createOrder.amounts).toEqual({
      sell: {
        quantity: '10',
        tokenId: 'policyId.sell',
      },
      buy: {
        quantity: '5',
        tokenId: 'policyId.buy',
      },
    })
  })

  it('ResetQuantities', () => {
    const initiState: SwapState = {
      createOrder: {
        ...defaultSwapState.createOrder,
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
        selectedPool: {
          provider: 'sundaeswap',
          fee: '0.5',
          batcherFee: {tokenId: '', quantity: '1'},
          deposit: {tokenId: '', quantity: '1'},
          lpToken: {tokenId: '', quantity: '1'},
          poolId: '1',
          price: 1,
          tokenA: {tokenId: 'policyId.sell', quantity: '1'},
          tokenB: {tokenId: 'policyId.buy', quantity: '1'},
        },
        limitPrice: '3',
        marketPrice: '1',
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

    expect(result.current.createOrder.amounts).toEqual({
      sell: {
        quantity: '0',
        tokenId: 'policyId.sell',
      },
      buy: {
        quantity: '0',
        tokenId: 'policyId.buy',
      },
    })
    expect(result.current.createOrder.limitPrice).toEqual('1')
  })

  it('ResetState', () => {
    const initialState: SwapState = {
      createOrder: {
        ...defaultSwapState.createOrder,
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

    expect(result.current.createOrder).toEqual(defaultSwapState.createOrder)
    expect(result.current.unsignedTx).toBeUndefined()
  })
})
