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

const bannersManagerMock: Banners.Manager<'t'> = {
  dismiss: jest.fn(),
  dismissedAt: jest.fn(),
}

type Props<K extends string = string> = {
  queryClient: QueryClient
  bannersManager?: Banners.Manager<K>
}

export const wrapperManagerFixture =
  <K extends string = string>({queryClient, bannersManager}: Props<K>) =>
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
  ({queryClient}: {queryClient: QueryClient}) =>
  ({children}: {children: React.ReactNode}) =>
    (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <SuspenseBoundary>{children}</SuspenseBoundary>
        </ErrorBoundary>
      </QueryClientProvider>
    )

describe('BannersProvider', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('works when provider is set', () => {
    const wrapper = wrapperManagerFixture({
      queryClient,
      bannersManager: bannersManagerMock,
    })

    const {result} = renderHook(() => useBanners(), {wrapper})

    act(() => {
      result.current.manager.dismiss('test-banner')
      result.current.manager.dismissedAt('test-banner')
    })

    expect(bannersManagerMock.dismiss).toHaveBeenCalledWith('test-banner')
    expect(bannersManagerMock.dismissedAt).toHaveBeenCalledWith('test-banner')
  })

  it('fails when provider is missing', () => {
    const wrapper = wrapperManagerFixtureMissing({queryClient})

    const {result} = renderHook(() => useBanners(), {wrapper})

    expect(result.current).toBeUndefined()
  })
})
