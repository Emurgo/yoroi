import * as React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'
import {renderHook, act} from '@testing-library/react-hooks'
import {
  ResolverAction,
  ResolverProvider,
  defaultResolverState,
  resolverReducer,
  useResolver,
} from './ResolverProvider'
import {Resolver} from '@yoroi/types'

const fakeAddressResponse: Resolver.AddressResponse = {
  address: 'fake-address',
  error: null,
  service: 'fake-service',
}

const fakeAddressesResponses: Resolver.AddressesResponse = [
  {
    address: 'fake-address',
    error: null,
    service: 'fake-service',
  },
]

const resolverModuleMock: Resolver.Module = {
  address: {
    getCryptoAddress: jest.fn((_receiver: string) =>
      Promise.resolve(fakeAddressesResponses),
    ),
  },
  notice: {
    read: jest.fn(() => Promise.resolve(true)),
    remove: jest.fn(),
    save: jest.fn(),
    key: 'string',
  },
}

describe('ResolverProvider', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    })
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('saveResolverNoticeStatus', () => {
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <ResolverProvider resolverModule={resolverModuleMock}>
          {children}
        </ResolverProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useResolver(), {
      wrapper,
    })

    expect(resolverModuleMock.notice.save).not.toHaveBeenCalled()

    act(() => {
      result.current.saveResolverNoticeStatus(true)
    })

    expect(resolverModuleMock.notice.save).toHaveBeenCalledWith(true)
  })

  it('readResolverNoticeStatus', async () => {
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <ResolverProvider resolverModule={resolverModuleMock}>
          {children}
        </ResolverProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useResolver(), {
      wrapper,
    })

    expect(await result.current.readResolverNoticeStatus()).toBe(true)
  })

  it('getCryptoAddress', async () => {
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <ResolverProvider resolverModule={resolverModuleMock}>
          {children}
        </ResolverProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useResolver(), {
      wrapper,
    })

    expect(await result.current.getCryptoAddress('fake-receiver')).toEqual(
      fakeAddressesResponses,
    )
  })

  it('resolvedAddressSelectedChanged', async () => {
    const wrapper = ({children}: any) => (
      <QueryClientProvider client={queryClient}>
        <ResolverProvider resolverModule={resolverModuleMock}>
          {children}
        </ResolverProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useResolver(), {
      wrapper,
    })

    expect(result.current.resolvedAddressSelected).toBe(null)

    act(() => {
      return result.current.resolvedAddressSelectedChanged(fakeAddressResponse)
    })

    expect(result.current.resolvedAddressSelected).toEqual(fakeAddressResponse)
  })
})

describe('resolverReducer', () => {
  it('default state', () => {
    const state = resolverReducer(defaultResolverState, {
      type: 'FAKE_ACTION',
    } as unknown as ResolverAction)

    expect(state.resolvedAddressSelected).toBe(
      defaultResolverState.resolvedAddressSelected,
    )
  })

  it('resolvedAddressSelectedChanged', () => {
    const state = resolverReducer(defaultResolverState, {
      type: 'resolvedAddressSelectedChanged',
      resolvedAddressSelected: fakeAddressResponse,
    })

    expect(state.resolvedAddressSelected).toEqual(fakeAddressResponse)
  })
})
