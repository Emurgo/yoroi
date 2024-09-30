import {QueryClient} from '@tanstack/react-query'

export const queryClientFixture = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
        networkMode: 'offlineFirst',
      },
      mutations: {
        retry: false,
        cacheTime: 0,
        networkMode: 'offlineFirst',
      },
    },
  })
