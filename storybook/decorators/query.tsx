import * as React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

export const QueryProvider = ({children}: {children: React.ReactNode}) => (
  <QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}}})}>
    {children}
  </QueryClientProvider>
)
