import * as React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {Boundary} from '../../src/components/Boundary/Boundary'

export const QueryProvider = ({children}: {children: React.ReactNode}) => (
  <QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}}})}>
    <Boundary loading={{size: 'full'}}>{children}</Boundary>
  </QueryClientProvider>
)
