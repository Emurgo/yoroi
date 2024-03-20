import {ErrorBoundary, SuspenseBoundary} from '@yoroi/common'
import * as React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

type Props = {
  queryClient: QueryClient
}
export const wrapper =
  ({queryClient}: Props) =>
  ({children}: {children: React.ReactNode}) =>
    (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <SuspenseBoundary>{children}</SuspenseBoundary>
        </ErrorBoundary>
      </QueryClientProvider>
    )
