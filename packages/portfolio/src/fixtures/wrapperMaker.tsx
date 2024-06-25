import {ErrorBoundary, SuspenseBoundary} from '@yoroi/common'
import * as React from 'react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

type Props = {
  queryClient: QueryClient
}

export const wrapperMaker =
  ({queryClient}: Props) =>
  ({children}: {children: React.ReactNode}) =>
    (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <SuspenseBoundary>{children}</SuspenseBoundary>
        </ErrorBoundary>
      </QueryClientProvider>
    )
