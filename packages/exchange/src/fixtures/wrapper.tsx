import * as React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

type Props = {
  queryClient: QueryClient
}

export const wrapperFixture =
  ({queryClient}: Props) =>
  ({children}: {children: React.ReactNode}) =>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
