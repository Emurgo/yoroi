import {
  MetricsFactoryOptions,
  Metrics,
  TrackProperties,
  MetricsStorage,
} from '@yoroi/types'

export function makeMockMetrics({
  apiKey,
  initialUserId,
  options,
}: MetricsFactoryOptions<any>): Metrics {
  console.debug('[metrics-react-native] mock ', apiKey, initialUserId, options)
  return {
    track: (args: TrackProperties) => {
      console.debug('[metrics-react-native] makeMockMetrics track', args)
    },
    disable: () => {
      console.debug('[metrics-react-native] makeMockMetrics disable')
    },
    enable: () => {
      console.debug('[metrics-react-native] makeMockMetrics enable')
    },
    setUserId: (userId: string) => {
      console.debug('[metrics-react-native] makeMockMetrics setUserId', userId)
    },
    setDeviceId: (deviceId: string) => {
      console.debug(
        '[metrics-react-native] makeMockMetrics setDeviceId',
        deviceId,
      )
    },
    setSessionId: (sessionId: number) => {
      console.debug(
        '[metrics-react-native] makeMockMetrics setSessionId',
        sessionId,
      )
    },
  }
}

export function makeMockMetricsStorage(): MetricsStorage {
  return {
    enabled: {
      read: async () => {
        console.debug(
          '[metrics-react-native] makeMockMetricsStorage enabled read',
        )
        return Promise.resolve(true)
      },
      remove: async () => {
        console.debug(
          '[metrics-react-native] makeMockMetricsStorage enabled remove',
        )
        return Promise.resolve()
      },
      save: async (enabled: boolean) => {
        console.debug(
          '[metrics-react-native] makeMockMetricsStorage enabled save',
          enabled,
        )
      },
    },
  }
}
