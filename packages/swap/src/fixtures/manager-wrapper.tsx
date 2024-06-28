import * as React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'
import {Swap} from '@yoroi/types'

import {SuspenseBoundary} from './SuspenseBoundary'
import {ErrorBoundary} from './ErrorBoundary'
import {SwapProvider} from '../translators/reactjs/provider/SwapProvider'

type Props = {
  queryClient: QueryClient
  swapManager: Swap.Manager
}

export const wrapperManagerFixture =
  ({queryClient, swapManager}: Props) =>
  ({children}: {children: React.ReactNode}) =>
    (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <SuspenseBoundary>
            <SwapProvider swapManager={swapManager}>{children}</SwapProvider>
          </SuspenseBoundary>
        </ErrorBoundary>
      </QueryClientProvider>
    )
