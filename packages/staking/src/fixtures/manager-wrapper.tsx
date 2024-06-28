import * as React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {SuspenseBoundary} from './SuspenseBoundary'
import {ErrorBoundary} from './ErrorBoundary'
import {CatalystProvider} from '../catalyst/translators/context'
import {Catalyst} from '../types'

type Props = {
  queryClient: QueryClient
  manager: Catalyst.Manager
}

export const wrapperManagerFixture =
  ({queryClient, manager}: Props) =>
  ({children}: {children: React.ReactNode}) =>
    (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <SuspenseBoundary>
            <CatalystProvider manager={manager}>{children}</CatalystProvider>
          </SuspenseBoundary>
        </ErrorBoundary>
      </QueryClientProvider>
    )
