import * as React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'
import {renderHook, act} from '@testing-library/react-hooks'
import {AppApi} from '@yoroi/api'
import {Portfolio} from '@yoroi/types'

import {SwapProvider} from './SwapProvider'
import {mockSwapManager, swapManagerMocks} from '../../../manager.mocks'
import {SwapState, defaultSwapState} from '../state/state'
import {queryClientFixture} from '../../../fixtures/query-client'
import {useSwap} from '../hooks/useSwap'
import {mocks} from '../../../helpers/mocks'
import {tokenInfoMocks} from '../../../tokenInfo.mocks'

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
          sell: asTokenAmount({
            quantity: 10n,
            tokenId: 'tokenA.',
          }),
          buy: asTokenAmount({
            quantity: 20n,
            tokenId: 'tokenB.',
          }),
        },
        tokens: {
          ptInfo: tokenInfoMocks.pt,
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
      result.current.switchTokens()
    })

    expect(result.current.orderData.amounts).toEqual<{
      sell: Portfolio.Token.Amount
      buy: Portfolio.Token.Amount
    }>({
      sell: asTokenAmount({
        quantity: 20n,
        tokenId: 'tokenB.',
      }),
      buy: asTokenAmount({
        quantity: 10n,
        tokenId: 'tokenA.',
      }),
    })
  })

  it('SwitchTokens limit', () => {
    const initialState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
        type: 'limit',
        limitPrice: '2',
        amounts: {
          sell: asTokenAmount({
            quantity: 10n,
            tokenId: 'tokenA.',
          }),
          buy: asTokenAmount({
            quantity: 20n,
            tokenId: 'tokenB.',
          }),
        },
        tokens: {
          ptInfo: tokenInfoMocks.pt,
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
      result.current.switchTokens()
    })

    expect(result.current.orderData.amounts).toEqual<{
      sell: Portfolio.Token.Amount
      buy: Portfolio.Token.Amount
    }>({
      sell: asTokenAmount({
        quantity: 20n,
        tokenId: 'tokenB.',
      }),
      buy: asTokenAmount({
        quantity: 10n,
        tokenId: 'tokenA.',
      }),
    })

    act(() => {
      result.current.switchTokens()
    })

    expect(result.current.orderData.amounts).toEqual({
      sell: asTokenAmount({
        quantity: 10n,
        tokenId: 'tokenA.',
      }),
      buy: asTokenAmount({
        quantity: 20n,
        tokenId: 'tokenB.',
      }),
    })
  })

  it('ResetQuantities', () => {
    const initiState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
        amounts: {
          sell: asTokenAmount({
            quantity: 1n,
            tokenId: 'tokenA.',
          }),
          buy: asTokenAmount({
            quantity: 2n,
            tokenId: 'tokenB.',
          }),
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

    expect(result.current.orderData.amounts).toEqual<{
      sell: Portfolio.Token.Amount
      buy: Portfolio.Token.Amount
    }>({
      sell: asTokenAmount({
        quantity: 0n,
        tokenId: 'tokenA.',
      }),
      buy: asTokenAmount({
        quantity: 0n,
        tokenId: 'tokenB.',
      }),
    })
    expect(result.current.orderData.limitPrice).toEqual(undefined)
  })

  it('ResetState', () => {
    const initialState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
        amounts: {
          sell: asTokenAmount({
            quantity: 1n,
            tokenId: 'policyId.sell',
          }),
          buy: asTokenAmount({
            quantity: 2n,
            tokenId: 'policyId.buy',
          }),
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
          sell: asTokenAmount({
            quantity: 10n,
            tokenId: 'policyId.sell',
          }),
          buy: asTokenAmount({
            quantity: 20n,
            tokenId: 'policyId.buy',
          }),
        },
        tokens: {
          ptInfo: tokenInfoMocks.pt,
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
      result.current.buyQuantityChanged(30n)
    })

    expect(result.current.orderData.amounts).toEqual({
      sell: asTokenAmount({
        quantity: 10n,
        tokenId: 'policyId.sell',
      }),
      buy: asTokenAmount({
        quantity: 30n,
        tokenId: 'policyId.buy',
      }),
    })
  })

  it('SellQuantityChanged', () => {
    const initialState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
        amounts: {
          sell: asTokenAmount({
            quantity: 10n,
            tokenId: 'policyId.sell',
          }),
          buy: asTokenAmount({
            quantity: 20n,
            tokenId: 'policyId.buy',
          }),
        },
        tokens: {
          ptInfo: tokenInfoMocks.pt,
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
      result.current.sellQuantityChanged(30n)
    })

    expect(result.current.orderData.amounts).toEqual({
      sell: asTokenAmount({
        quantity: 30n,
        tokenId: 'policyId.sell',
      }),
      buy: asTokenAmount({
        quantity: 20n,
        tokenId: 'policyId.buy',
      }),
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
      result.current.lpTokenHeldChanged(
        asTokenAmount({
          quantity: 30n,
          tokenId: 'policyId.tokenHeld',
        }),
      )
    })

    expect(result.current.orderData.lpTokenHeld).toEqual(
      asTokenAmount({
        quantity: 30n,
        tokenId: 'policyId.tokenHeld',
      }),
    )
  })

  it('BuyTokenInfoChanged', () => {
    const initialState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
        amounts: {
          sell: {
            quantity: 10n,
            info: tokenInfoMocks.a,
          },
          buy: {
            quantity: 20n,
            info: tokenInfoMocks.b,
          },
        },
        tokens: {
          ptInfo: tokenInfoMocks.pt,
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
      result.current.buyTokenInfoChanged(tokenInfoMocks.c)
    })

    expect(
      result.current.orderData.amounts.buy,
    ).toEqual<Portfolio.Token.Amount>({
      quantity: 20n,
      info: tokenInfoMocks.c,
    })
    expect(result.current.orderData.tokens.priceDenomination).toBe(4)
  })

  it('SellTokenInfoChanged', () => {
    const initialState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
        amounts: {
          sell: {
            quantity: 1000000n,
            info: tokenInfoMocks.a,
          },
          buy: {
            quantity: 20n,
            info: tokenInfoMocks.b,
          },
        },
        tokens: {
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
      result.current.sellTokenInfoChanged(tokenInfoMocks.c)
    })

    expect(
      result.current.orderData.amounts.sell,
    ).toEqual<Portfolio.Token.Amount>({
      quantity: 100n,
      info: tokenInfoMocks.c,
    })
    expect(result.current.orderData.tokens.priceDenomination).toBe(-4)
  })

  it('PoolPairsChanged', () => {
    const initialState: SwapState = {
      orderData: {
        ...defaultSwapState.orderData,
        tokens: {
          ...defaultSwapState.orderData.tokens,
          ptInfo: tokenInfoMocks.pt,
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
      result.current.primaryTokenInfoChanged(tokenInfoMocks.pt)
    })

    expect(result.current.orderData.tokens.ptInfo).toEqual(tokenInfoMocks.pt)
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

function asTokenAmount(
  {
    tokenId,
    quantity,
  }: {
    tokenId: Portfolio.Token.Id
    quantity: bigint
  },
  decimals = 6,
) {
  const amount: Portfolio.Token.Amount = {
    quantity,
    info: {
      id: tokenId,
      decimals,

      application: Portfolio.Token.Application.Coin,
      nature: Portfolio.Token.Nature.Secondary,
      status: Portfolio.Token.Status.Valid,
      type: Portfolio.Token.Type.FT,

      fingerprint: '',
      name: '',
      ticker: '',
      description: '',
      symbol: '',
      tag: '',
      reference: '',
      website: '',
      originalImage: '',
    },
  }

  return amount
}
