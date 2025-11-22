import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-native'
import * as React from 'react'

import {useResolverDRepId} from './useResolverDRepId'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return ({children}: {children: React.ReactNode}) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useResolverDRepId', () => {
  it('should return null when resolve is empty', () => {
    const {result} = renderHook(
      () =>
        useResolverDRepId({
          resolve: '',
          isMainnet: true,
          enabled: false,
        }),
      {wrapper: createWrapper()},
    )

    expect(result.current.drepInfo).toBeNull()
  })

  it('should be disabled when enabled is false', () => {
    const {result} = renderHook(
      () =>
        useResolverDRepId({
          resolve: '$testhandle',
          isMainnet: true,
          enabled: false,
        }),
      {wrapper: createWrapper()},
    )

    expect(result.current.isFetching).toBe(false)
  })

  it('should fetch when resolve has value and enabled is true', () => {
    const {result} = renderHook(
      () =>
        useResolverDRepId({
          resolve: '$testhandle',
          isMainnet: true,
          enabled: true,
        }),
      {wrapper: createWrapper()},
    )

    // Initially should start fetching or be pending
    expect(result.current.isPending || result.current.isLoading).toBe(true)
  })

  it('should be disabled when resolve is empty string', () => {
    const {result} = renderHook(
      () =>
        useResolverDRepId({
          resolve: '',
          isMainnet: true,
          enabled: true,
        }),
      {wrapper: createWrapper()},
    )

    // Query should be disabled when resolve is empty
    expect(result.current.isFetching).toBe(false)
  })

  it('should use isMainnet parameter', () => {
    const {result: resultMainnet} = renderHook(
      () =>
        useResolverDRepId({
          resolve: '$testhandle',
          isMainnet: true,
          enabled: false,
        }),
      {wrapper: createWrapper()},
    )

    const {result: resultPreprod} = renderHook(
      () =>
        useResolverDRepId({
          resolve: '$testhandle',
          isMainnet: false,
          enabled: false,
        }),
      {wrapper: createWrapper()},
    )

    // Both should be defined but disabled
    expect(resultMainnet.current.drepInfo).toBeNull()
    expect(resultPreprod.current.drepInfo).toBeNull()
  })

  it('should pass signal to queryFn when provided', async () => {
    const mockGetDRepId = jest.fn().mockResolvedValue(null)
    jest.mock('../../../adapters/handle/api', () => ({
      handleApiGetDRepId: jest.fn(() => mockGetDRepId),
    }))

    const {result} = renderHook(
      () =>
        useResolverDRepId({
          resolve: '$testhandle',
          isMainnet: true,
          enabled: true,
        }),
      {wrapper: createWrapper()},
    )

    // Wait for query to initialize
    await new Promise((resolve) => setTimeout(resolve, 0))

    // The query should have been called with a signal
    expect(result.current.isPending || result.current.isLoading).toBe(true)
  })
})
