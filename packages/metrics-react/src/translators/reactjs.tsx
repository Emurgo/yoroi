import * as React from 'react'
import {
  QueryKey,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  useMutation,
} from 'react-query'
import {Metrics} from '@yoroi/types'
import * as Amplitude from '@amplitude/analytics-browser'

import {makeMockMetrics, makeMockMetricsStorage} from '../adapters/mocks'
import {metricsStorageEnabledKey} from '../adapters/storage'

type MetricsState = {
  sessionId: number
}
type MetricsActions = {
  sessionIdChanged: (sessionId: number) => void
}

type MetricsProvider = React.PropsWithChildren<
  MetricsState &
    MetricsActions &
    Metrics.Module<Amplitude.Types.EventOptions> &
    Metrics.Storage
>

const defaultState: MetricsState = {
  sessionId: new Date().getTime(),
} as const
const defaultActions: MetricsActions = {
  sessionIdChanged: (_sessionId: number) =>
    console.error('[metrics-react] missing initialization'),
} as const
const defaultMetrics: Metrics.Module<Amplitude.Types.EventOptions> =
  makeMockMetrics({
    apiKey: 'mocked-api-key',
  })
const defaultStorage: Metrics.Storage = makeMockMetricsStorage()
const initialMetricsProvider: MetricsProvider = {
  ...defaultState,
  ...defaultActions,
  ...defaultMetrics,
  ...defaultStorage,
}

const MetricsContext = React.createContext<MetricsProvider>(
  initialMetricsProvider,
)

export const useMetrics = () => {
  const value = React.useContext(MetricsContext)
  if (!value) {
    throw new Error(
      '[metrics-react] useMetrics must be used within a MetricsProvider',
    )
  }
  return value
}

export const MetricsProvider = ({
  children,
  metrics,
  storage,
  initialState,
}: {
  children: React.ReactNode
  metrics: Readonly<Metrics.Module<Amplitude.Types.EventOptions>>
  storage: Readonly<Metrics.Storage>
  initialState?: Readonly<Partial<MetricsState>>
}) => {
  const [state, dispatch] = React.useReducer(metricsReducer, {
    ...defaultState,
    ...initialState,
  })
  const actions = React.useRef<MetricsActions>({
    sessionIdChanged: (sessionId: number) => {
      metrics.setSessionId(sessionId)
      dispatch({type: 'sessionIdChanged', sessionId})
    },
  }).current

  const context = React.useMemo(
    () => ({...state, ...actions, ...metrics, ...storage}),
    [state, actions, metrics, storage],
  )

  return (
    <MetricsContext.Provider value={context}>
      {children}
    </MetricsContext.Provider>
  )
}

type MetricsAction = {type: 'sessionIdChanged'; sessionId: number}

function metricsReducer(state: MetricsState, action: MetricsAction) {
  switch (action.type) {
    case 'sessionIdChanged':
      const {sessionId} = action
      return {...state, sessionId}

    default:
      throw new Error('[metrics-react] metricsReducer invalid action')
  }
}

// * === SETTINGS ===
// * NOTE maybe it should be moved as part of wallet settings package
export const useSendMetricsEnabled = (storage: Metrics.Storage) => {
  const query = useQuery({
    suspense: true,
    queryKey: [metricsStorageEnabledKey],
    queryFn: storage.enabled.read,
  })

  if (query.data == null)
    throw new Error('[metrics-react] useCrashReportsEnabled invalid state')

  return query.data
}

export const useSetSendMetricsEnabled = (
  storage: Metrics.Storage,
  options?: UseMutationOptions<void, Error, boolean>,
) => {
  const mutation = useMutationWithInvalidations<void, Error, boolean>({
    ...options,
    useErrorBoundary: true,
    mutationFn: storage.enabled.save,
    invalidateQueries: [[metricsStorageEnabledKey]],
  })

  return mutation.mutate
}

// * NOTE it should be changed to consume the storage from the hooks package
export const useMetricsSettings = (storage: Metrics.Storage) => {
  const set = useSetSendMetricsEnabled(storage)
  const enabled = useSendMetricsEnabled(storage)
  const metrics = useMetrics()

  return {
    enabled,
    enable: React.useCallback(
      () =>
        set(true, {
          onSuccess: metrics.enable,
        }),
      [set, metrics.enable],
    ),
    disable: React.useCallback(
      () =>
        set(false, {
          onSuccess: metrics.disable,
        }),
      [set, metrics.disable],
    ),
  }
}

// * === HOOKS ===
// * NOTE copied from wallet-mobile it should be imported from hooks package later
const useMutationWithInvalidations = <
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>({
  invalidateQueries,
  ...options
}: UseMutationOptions<TData, TError, TVariables, TContext> & {
  invalidateQueries?: Array<QueryKey>
} = {}) => {
  const queryClient = useQueryClient()

  return useMutation<TData, TError, TVariables, TContext>({
    ...options,
    onMutate: (variables) => {
      invalidateQueries?.forEach((key) => queryClient.cancelQueries(key))
      return options?.onMutate?.(variables)
    },
    onSuccess: (data, variables, context) => {
      invalidateQueries?.forEach((key) => queryClient.invalidateQueries(key))
      return options?.onSuccess?.(data, variables, context)
    },
  })
}
