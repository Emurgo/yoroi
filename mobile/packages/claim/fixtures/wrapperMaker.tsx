import {Claim} from '@yoroi/types'

import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import * as React from 'react'

import {ClaimProvider} from '../translators/reactjs/provider/ClaimProvider'
import {ClaimState} from '../translators/reactjs/state/state'
import {ErrorBoundary} from './ErrorBoundary'
import {SuspenseBoundary} from './SuspenseBoundary'

type Props = {
  queryClient: QueryClient
  claimManager: Claim.Manager
  initialState?: ClaimState
}

export const wrapperMaker =
  ({queryClient, claimManager, initialState}: Props) =>
  ({children}: {children: React.ReactNode}) => (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <SuspenseBoundary>
          <ClaimProvider manager={claimManager} initialState={initialState}>
            {children}
          </ClaimProvider>
        </SuspenseBoundary>
      </ErrorBoundary>
    </QueryClientProvider>
  )
