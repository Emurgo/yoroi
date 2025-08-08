import * as React from 'react'

import {SuspenseBoundary} from './SuspenseBoundary'
import {ErrorBoundary} from './ErrorBoundary'
import {CatalystProvider} from '../catalyst/translators/context'
import {Catalyst} from '../types'

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
