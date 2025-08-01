import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {createPersistQueryClient} from '@tanstack/react-query-persist-client'
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister'
import * as React from 'react'

import {rootStorage} from '../storage/storages'

const persister = createAsyncStoragePersister({
  storage: rootStorage,
})

const queryClient = createPersistQueryClient({
  queryClient: new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error instanceof Error && error.message.includes('4')) {
            return false
          }
          return failureCount < 3
        },
      },
      mutations: {
        retry: false,
      },
    },
  }),
  persister,
})

export function QueryProvider({children}: React.PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
} 