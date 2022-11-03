import * as React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {Boundary} from '../../src/components'

export const QueryProvider = ({children}: {children: React.ReactNode}) => (
  <QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}}})}>
    <Boundary loading={{fallbackProps: {style: {flex: 1}}}}>{children}</Boundary>
  </QueryClientProvider>
)
