import {QueryClient} from '@tanstack/react-query'

export const queryClientFixture = () =>
  new QueryClient({
    logger: {log: console.log, warn: console.warn, error: () => {}},
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
        cacheTime: 0,
      },
    },
  })
