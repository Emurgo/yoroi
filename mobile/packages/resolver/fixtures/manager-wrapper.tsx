import {Resolver} from '@yoroi/types'
import {QueryClientProvider} from '@tanstack/react-query'

import * as React from 'react'

import {ResolverProvider} from '../translators/reactjs/provider/ResolverProvider'
import {queryClientFixture} from './query-client'
import {ErrorBoundary} from './ErrorBoundary'
import {SuspenseBoundary} from './SuspenseBoundary'

type Props = {
  resolverManager: Resolver.Manager
}

export const wrapperManagerFixture =
  ({resolverManager}: Props) =>
  ({children}: {children: React.ReactNode}) => {
    const queryClient = queryClientFixture()

    return (
      <ErrorBoundary>
        <SuspenseBoundary>
          <QueryClientProvider client={queryClient}>
            <ResolverProvider resolverManager={resolverManager}>
              {children}
            </ResolverProvider>
          </QueryClientProvider>
        </SuspenseBoundary>
      </ErrorBoundary>
    )
  }
