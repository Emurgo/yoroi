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
import {NetworkState} from './types'

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

const cacheKeyIndicator: QueryKey = freeze(['cache'])
const dehydrateOptions: PersistQueryClientProviderProps['persistOptions']['dehydrateOptions'] =
  {
    shouldDehydrateMutation: () => false,
    shouldDehydrateQuery: ({queryKey}) =>
      cacheKeyIndicator.includes(String(queryKey[0])),
  }

const NetworkContext = React.createContext<NetworkState>(NetworkState.Unclear)

export const useNetworkState = () => React.useContext(NetworkContext)

const offlineUrl = 'https://localhost/error'
let failedRequestToUrl = new Set<string>()

// Wrapper for fetchData that updates network state
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

export const NetworkProvider = ({children}: React.PropsWithChildren) => {
  const pendingPromiseRef = React.useRef<Promise<void> | undefined>(undefined)
  // NOTE: subscribe to onlineManager.subscribe is pointless since
  // it can have a pending promise that is not resolved yet
  // and eventually will change the state
  const [networkState, setNetworkState] = React.useState<NetworkState>(() =>
    onlineManager.isOnline() ? NetworkState.Online : NetworkState.Unclear,
  )

  const checkIsOnlineIfNeeded = React.useCallback(() => {
    if (pendingPromiseRef.current) return

    const promise = isOnline().then((ok) => {
      pendingPromiseRef.current = undefined

      const hasFailedRequests = failedRequestToUrl.size > 0
      
      // Set network state to Unclear when there's a mismatch between
      // online status and failed requests
      if ((ok && hasFailedRequests) || (!ok && !hasFailedRequests)) {
        setNetworkState(NetworkState.Unclear)
        return
      }

      // Update online status and network state when there are no failed requests
      // to recover from Unclear only if the request to the url path is successful again
      if (!hasFailedRequests) {
        onlineManager.setOnline(ok)
        setNetworkState(ok ? NetworkState.Online : NetworkState.Offline)
      }
    })
    pendingPromiseRef.current = promise
  }, [])

  React.useEffect(() => {
    const handleNetworkOffline = () => {
      failedRequestToUrl.add(offlineUrl)
      logger.error('Network offline', {origin: 'NetworkProvider', type: 'http'})
      onlineManager.setOnline(false)
    }

    const handleNetworkOnline = () => {
      if (failedRequestToUrl.delete(offlineUrl)) {
        logger.debug('Network online', {
          origin: 'NetworkProvider',
          type: 'http',
        })
      }
      onlineManager.setOnline(true)
    }

    // Set up network listeners
    if (isWeb) {
      window?.addEventListener('offline', handleNetworkOffline)
      window?.addEventListener('online', handleNetworkOnline)
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
        window?.removeEventListener('offline', handleNetworkOffline)
        window?.removeEventListener('online', handleNetworkOnline)
      }

      clearInterval(interval)
    }
  }, [checkIsOnlineIfNeeded])

  return (
    <NetworkContext.Provider value={networkState}>
      <PersistQueryClientProvider
        persistOptions={{
          persister,
          dehydrateOptions,
        }}
        client={queryClient}
      >
        {children}
      </PersistQueryClientProvider>
    </NetworkContext.Provider>
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
        // TODO: needs to be changed to the correct url
        url: 'https://zero.yoroiwallet.com/bestblock',
      },
      {
        signal: controller.signal,
      },
    )

    if (isRight(response)) return Boolean(response.value.data?.height)

    return false
  } catch (error) {
    logger.error(error as Error, {origin: 'isOnline', type: 'http'})
    return false
  } finally {
    clearTimeout(timeout)
  }
}

// NOTE: part of network - for react-query to manage refetching on focus
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
