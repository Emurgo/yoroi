import * as React from 'react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

import {Boundary} from '../../src/components'

export const QueryProvider = ({children}: {children: React.ReactNode}) => (
  <QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}}})}>
    <Boundary loading={{size: 'full'}}>{children}</Boundary>
  </QueryClientProvider>
)
