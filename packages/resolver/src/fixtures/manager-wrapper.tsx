import {Resolver} from '@yoroi/types'
import * as React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {SuspenseBoundary} from './SuspenseBoundary'
import {ErrorBoundary} from './ErrorBoundary'
import {ResolverProvider} from '../translators/reactjs/provider/ResolverProvider'

type Props = {
  queryClient: QueryClient
  resolverManager: Resolver.Manager
}

export const wrapperManagerFixture =
  ({queryClient, resolverManager}: Props) =>
  ({children}: {children: React.ReactNode}) =>
    (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <SuspenseBoundary>
            <ResolverProvider resolverManager={resolverManager}>
              {children}
            </ResolverProvider>
          </SuspenseBoundary>
        </ErrorBoundary>
      </QueryClientProvider>
    )
