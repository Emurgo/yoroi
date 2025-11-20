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

    // Initially åshould start fetching or be pending
    expect(result.current.isPending || result.current.isLoading).toBe(true)
  })
})
