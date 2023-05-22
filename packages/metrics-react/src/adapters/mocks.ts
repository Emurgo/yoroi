import {Metrics} from '@yoroi/types'

export function makeMockMetrics({
  apiKey,
  options,
}: Metrics.FactoryOptions<any>): Metrics.Module<any> {
  console.debug('[metrics-react] mock', apiKey, options)
  return {
    track: (args: Metrics.Track<any>) => {
      console.debug('[metrics-react] makeMockMetrics track', args)
    },
    disable: () => {
      console.debug('[metrics-react] makeMockMetrics disable')
    },
    enable: () => {
      console.debug('[metrics-react] makeMockMetrics enable')
    },
    setUserId: (userId: string) => {
      console.debug('[metrics-react] makeMockMetrics setUserId', userId)
    },
    setDeviceId: (deviceId: string) => {
      console.debug('[metrics-react] makeMockMetrics setDeviceId', deviceId)
    },
    setSessionId: (sessionId: number) => {
      console.debug('[metrics-react] makeMockMetrics setSessionId', sessionId)
    },
  }
}

export function makeMockMetricsStorage(): Metrics.Storage {
  return {
    enabled: {
      read: async () => {
        console.debug('[metrics-react] makeMockMetricsStorage enabled read')
        return Promise.resolve(true)
      },
      remove: async () => {
        console.debug('[metrics-react] makeMockMetricsStorage enabled remove')
        return Promise.resolve()
      },
      save: async (enabled: boolean) => {
        console.debug(
          '[metrics-react] makeMockMetricsStorage enabled save',
          enabled,
        )
      },
    },
  }
}
