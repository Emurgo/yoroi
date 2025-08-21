import * as React from 'react'

import {CatalystProvider} from '../catalyst/translators/context'
import {Catalyst} from '../types'
import {ErrorBoundary} from './ErrorBoundary'
import {SuspenseBoundary} from './SuspenseBoundary'

type Props = {
  manager: Catalyst.Manager
}

export const wrapperManagerFixture =
  ({manager}: Props) =>
  ({children}: {children: React.ReactNode}) => (
    <ErrorBoundary>
      <SuspenseBoundary>
        <CatalystProvider manager={manager}>{children}</CatalystProvider>
      </SuspenseBoundary>
    </ErrorBoundary>
  )
