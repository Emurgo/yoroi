import {Metrics} from '@yoroi/types'

export function makeMockMetrics({
  apiKey,
  initialUserId,
  options,
}: Metrics.FactoryOptions<any>): Metrics.Module<any> {
  console.debug('[metrics-react-native] mock', apiKey, initialUserId, options)
  return {
    track: (args: Metrics.Track<any>) => {
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

export function makeMockMetricsStorage(): Metrics.Storage {
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
