import {
  Metrics,
  MetricsFactoryOptions,
  MetricsStorage,
  TrackProperties,
} from '@yoroi/types'

export function makeMockMetrics({
  apiKey,
  options,
}: MetricsFactoryOptions<any>): Metrics {
  console.debug('[metrics-node] mock ', apiKey, options)
  return {
    track: (args: TrackProperties) => {
      console.debug('[metrics-node] makeMockMetrics track', args)
    },
    disable: () => {
      console.debug('[metrics-node] makeMockMetrics disable')
    },
    enable: () => {
      console.debug('[metrics-node] makeMockMetrics enable')
    },
    setUserId: (userId: string) => {
      console.debug('[metrics-node] makeMockMetrics setUserId', userId)
    },
    setDeviceId: (deviceId: string) => {
      console.debug('[metrics-node] makeMockMetrics setDeviceId', deviceId)
    },
    setSessionId: (sessionId: number) => {
      console.debug('[metrics-node] makeMockMetrics setSessionId', sessionId)
    },
  }
}

export function makeMockMetricsStorage(): MetricsStorage {
  return {
    enabled: {
      read: async () => {
        console.debug('[metrics-node] makeMockMetricsStorage enabled read')
        return Promise.resolve(true)
      },
      remove: async () => {
        console.debug('[metrics-node] makeMockMetricsStorage enabled remove')
        return Promise.resolve()
      },
      save: async (enabled: boolean) => {
        console.debug(
          '[metrics-node] makeMockMetricsStorage enabled save',
          enabled,
        )
      },
    },
  }
}
