import {Resolver} from '@yoroi/types'

import * as React from 'react'

import {SuspenseBoundary} from './SuspenseBoundary'
import {ErrorBoundary} from './ErrorBoundary'
import {ResolverProvider} from '../translators/reactjs/provider/ResolverProvider'

type Props = {
  resolverManager: Resolver.Manager
}

export const wrapperManagerFixture =
  ({resolverManager}: Props) =>
  ({children}: {children: React.ReactNode}) => (
    <ErrorBoundary>
      <SuspenseBoundary>
        <ResolverProvider resolverManager={resolverManager}>
          {children}
        </ResolverProvider>
      </SuspenseBoundary>
    </ErrorBoundary>
  )
