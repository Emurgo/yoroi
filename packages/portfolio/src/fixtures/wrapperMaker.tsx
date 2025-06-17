import * as React from 'react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

import {ErrorBoundary} from './ErrorBoundary'
import {SuspenseBoundary} from './SuspenseBoundary'

type Props = {
  queryClient: QueryClient
}

export const wrapperMaker =
  ({queryClient}: Props) =>
  ({children}: React.PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <SuspenseBoundary>{children}</SuspenseBoundary>
      </ErrorBoundary>
    </QueryClientProvider>
  )
