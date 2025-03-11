import * as React from 'react'
import {Banners} from '@yoroi/types'
import {
  queryClientFixture,
  ErrorBoundary,
  SuspenseBoundary,
} from '@yoroi/common'
import {QueryClient, QueryClientProvider} from 'react-query'
import {renderHook, act} from '@testing-library/react-hooks'

import {BannersProvider, useBanners} from './BannersProvider'

const bannersManagerMock: Banners.Manager = {
  dismiss: jest.fn(),
  dismissedAt: jest.fn(),
}

type Props = {
  queryClient: QueryClient
  bannersManager?: Banners.Manager
}

export const wrapperManagerFixture =
  ({queryClient, bannersManager}: Props) =>
  ({children}: {children: React.ReactNode}) =>
    (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <SuspenseBoundary>
            <BannersProvider manager={bannersManager!}>
              {children}
            </BannersProvider>
          </SuspenseBoundary>
        </ErrorBoundary>
      </QueryClientProvider>
    )

export const wrapperManagerFixtureMissing =
  ({queryClient}: Props) =>
  ({children}: {children: React.ReactNode}) =>
    (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <SuspenseBoundary>{children}</SuspenseBoundary>
        </ErrorBoundary>
      </QueryClientProvider>
    )

describe('ResolverProvider', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('works', () => {
    const wrapper = wrapperManagerFixture({
      queryClient,
      bannersManager: bannersManagerMock,
    })
    const {result} = renderHook(() => useBanners(), {
      wrapper,
    })

    act(() => {
      result.current.manager.dismiss('test-banner')
      result.current.manager.dismissedAt('test-banner')
    })

    expect(bannersManagerMock.dismiss).toHaveBeenCalledWith('test-banner')
    expect(bannersManagerMock.dismissedAt).toHaveBeenCalledWith('test-banner')
  })

  it('fails', () => {
    const wrapper = wrapperManagerFixtureMissing({
      queryClient,
    })
    const {result} = renderHook(() => useBanners(), {
      wrapper,
    })

    expect(() => result.current.manager.dismiss('test-banner')).toThrow()
    expect(() => result.current.manager.dismissedAt('test-banner')).toThrow()
  })
})
