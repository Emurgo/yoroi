import {
  fetchData,
  FetchData,
  getBasePath,
  isRight,
  RequestConfig,
  time,
} from '@yoroi/common'
import {Api} from '@yoroi/types'

import AsyncStorage from '@react-native-async-storage/async-storage'
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister'
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryKey,
} from '@tanstack/react-query'
import {
  PersistQueryClientProvider,
  PersistQueryClientProviderProps,
} from '@tanstack/react-query-persist-client'
import {AxiosRequestConfig} from 'axios'
import {freeze} from 'immer'
import * as React from 'react'
import {AppState, AppStateStatus} from 'react-native'

import {isWeb} from '../constants'
import {logger} from '../logger/logger'
import {ConnectionStatus} from './types'

// IMPORTANT:
// 1. don't use the word "network" in this file, it's confusing
// 2. use "connection" instead, network is for chain-specific stuff
// 3. don't delete this comment

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      structuralSharing: false,
    },
    mutations: {
      retry: false,
    },
  },
})

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'react-query-cache',
})

export const persistPrefixKeyword = 'persist'
const cacheKeyIndicator: QueryKey = freeze([persistPrefixKeyword])
const dehydrateOptions: PersistQueryClientProviderProps['persistOptions']['dehydrateOptions'] =
  {
    shouldDehydrateMutation: () => false,
    shouldDehydrateQuery: ({queryKey}) =>
      cacheKeyIndicator.includes(String(queryKey[0])),
  }

const ConnectionContext = React.createContext<ConnectionStatus>(
  ConnectionStatus.Unclear,
)

export const useConnectionStatus = () => React.useContext(ConnectionContext)

const offlineUrl = 'https://localhost/error'
let failedRequestToUrl = new Set<string>()

// Wrapper for fetchData that updates connection state
export const request: FetchData = async <T, D = any>(
  config: RequestConfig<D>,
  fetcherConfig?: AxiosRequestConfig<D>,
) => {
  const originalOnSuccess = config.onSuccess
  const originalOnError = config.onError
  const basePath = getBasePath(config.url)

  const appConfig: RequestConfig<D> = {
    ...config,
    onSuccess: () => {
      originalOnSuccess?.()
      // to recover from Unclear only if the request to the url path is successful again
      if (failedRequestToUrl.delete(basePath)) {
        logger.debug('Recovered from request failure', {
          url: config.url,
          origin: 'request',
          type: 'http',
        })
      }
    },
    onError: () => {
      failedRequestToUrl.add(basePath)
      originalOnError?.()
      logger.error('Failed to request', {
        url: config.url,
        origin: 'request',
        type: 'http',
      })
    },
  }

  return fetchData<T, D>(appConfig, fetcherConfig)
}

export const ConnectionProvider = ({children}: React.PropsWithChildren) => {
  const pendingPromiseRef = React.useRef<Promise<void> | undefined>(undefined)
  const [connectionStatus, setConnectionStatus] =
    React.useState<ConnectionStatus>(() =>
      onlineManager.isOnline()
        ? ConnectionStatus.Online
        : ConnectionStatus.Unclear,
    )

  const checkIsOnlineIfNeeded = React.useCallback(() => {
    if (pendingPromiseRef.current) return

    const promise = isOnline().then((ok) => {
      pendingPromiseRef.current = undefined

      const hasFailedRequests = failedRequestToUrl.size > 0

      // Set connection status to Unclear when there's a mismatch between
      // online status and failed requests
      if ((ok && hasFailedRequests) || (!ok && !hasFailedRequests)) {
        setConnectionStatus(ConnectionStatus.Unclear)
        return
      }

      onlineManager.setOnline(ok)
      setConnectionStatus(
        ok ? ConnectionStatus.Online : ConnectionStatus.Offline,
      )
    })
    pendingPromiseRef.current = promise
  }, [])

  React.useEffect(() => {
    const handleConnectionOffline = () => {
      failedRequestToUrl.add(offlineUrl)
      logger.error('Connection is offline', {
        origin: 'ConnectionProvider',
        type: 'http',
      })
      onlineManager.setOnline(false)
    }

    const handleConnectionOnline = () => {
      if (failedRequestToUrl.delete(offlineUrl)) {
        logger.debug('Connection is online', {
          origin: 'ConnectionProvider',
          type: 'http',
        })
      }
      onlineManager.setOnline(true)
    }

    // Set up connection listeners
    if (isWeb) {
      window?.addEventListener('offline', handleConnectionOffline)
      window?.addEventListener('online', handleConnectionOnline)
    }

    // Set up interval check
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') {
        if (!onlineManager.isOnline() || failedRequestToUrl.size > 0) {
          checkIsOnlineIfNeeded()
        }
      }
    }, time.seconds(2))

    return () => {
      if (isWeb) {
        window?.removeEventListener('offline', handleConnectionOffline)
        window?.removeEventListener('online', handleConnectionOnline)
      }

      clearInterval(interval)
    }
  }, [checkIsOnlineIfNeeded])

  return (
    <ConnectionContext.Provider value={connectionStatus}>
      <PersistQueryClientProvider
        persistOptions={{
          persister,
          dehydrateOptions,
        }}
        client={queryClient}
      >
        {children}
      </PersistQueryClientProvider>
    </ConnectionContext.Provider>
  )
}

async function isOnline() {
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, time.seconds(15))

  try {
    const response = await fetchData<Api.Cardano.BestBlock>(
      {
        // TODO: we miss a health check endpoint
        url: 'https://zero.yoroiwallet.com/bestblock',
      },
      {
        signal: controller.signal,
      },
    )

    if (isRight(response)) return Boolean(response.value.data?.height)

    return false
  } finally {
    clearTimeout(timeout)
  }
}

// NOTE: part of connection - for react-query to manage refetching on focus
focusManager.setEventListener((onFocus) => {
  if (!isWeb) {
    const subscription = AppState.addEventListener(
      'change',
      (status: AppStateStatus) => {
        focusManager.setFocused(status === 'active')
      },
    )

    return () => subscription.remove()
  } else if (isWeb && window?.addEventListener) {
    const handler = () => onFocus()
    window.addEventListener('focus', handler, false)
    window.addEventListener('visibilitychange', handler, false)
    return () => {
      window.removeEventListener('visibilitychange', handler)
      window.removeEventListener('focus', handler)
    }
  }
})
