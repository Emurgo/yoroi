import {DehydratedState, QueryClient} from '@tanstack/react-query'
import {PersistedClient, Persister, persistQueryClient} from '@tanstack/react-query-persist-client'
import {freeze} from 'immer'

import {logger} from './logger/logger'
import {rootStorage} from './storage/rootStorage'

const queryClient = new QueryClient()
const keyToPersist = 'persist'
const queryPersisterStorageKey = 'react-query-persister'
const queryPersisterStorage: Persister = {
  persistClient: async (client: PersistedClient) => {
    try {
      const filteredState: DehydratedState = {
        mutations: client.clientState.mutations,
        queries: client.clientState.queries.filter((query) => query.queryKey[0] === keyToPersist),
      }
      const filteredClient: PersistedClient = {
        ...client,
        clientState: filteredState,
      }
      await rootStorage.setItem(queryPersisterStorageKey, JSON.stringify(filteredClient))
    } catch (error) {
      logger.error('ReactQueryPersister: Error saving data to AsyncStorage')
    }
  },
  restoreClient: async () => {
    try {
      const data = await rootStorage.getItem(queryPersisterStorageKey)
      return data != null ? JSON.parse(data as never) : undefined
    } catch (error) {
      logger.error('ReactQueryPersister: Error restoring data to AsyncStorage')
      return undefined
    }
  },
  removeClient: async () => {
    try {
      await rootStorage.removeItem(queryPersisterStorageKey)
    } catch (error) {
      logger.error('ReactQueryPersister: Error removing data to AsyncStorage')
    }
  },
}
persistQueryClient({
  queryClient,
  persister: queryPersisterStorage,
  maxAge: 24 * 60 * 60 * 1000, // Optional, set the maximum age of persisted queries (in milliseconds)
})

export const queryInfo = freeze({keyToPersist, queryClient})
