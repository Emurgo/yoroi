import {TrackProperties} from '../features/all'
import {MetricsFactoryOptions, Metrics, MetricsStorage} from '../types/metrics'

export function makeMockMetrics({apiKey}: MetricsFactoryOptions<any>): Metrics {
  console.debug(apiKey)
  return {
    init: () => {
      console.debug('[metrics] makeMockMetrics init', apiKey)
    },
    track: (args: TrackProperties) => {
      console.debug('[metrics] makeMockMetrics track', args)
    },
    disable: () => {
      console.debug('[metrics] makeMockMetrics disable')
    },
    enable: () => {
      console.debug('[metrics] makeMockMetrics enable')
    },
    setUserId: (userId: string) => {
      console.debug('[metrics] makeMockMetrics setUserId', userId)
    },
    setDeviceId: (deviceId: string) => {
      console.debug('[metrics] makeMockMetrics setDeviceId', deviceId)
    },
    setSessionId: (sessionId: number) => {
      console.debug('[metrics] makeMockMetrics setSessionId', sessionId)
    },
  }
}

export function makeMockMetricsStorage(): MetricsStorage {
  return {
    enabled: {
      read: async () => {
        console.debug('[metrics] makeMockMetricsStorage enabled read')
        return Promise.resolve(true)
      },
      remove: async () => {
        console.debug('[metrics] makeMockMetricsStorage enabled remove')
        return Promise.resolve()
      },
      save: async (enabled: boolean) => {
        console.debug('[metrics] makeMockMetricsStorage enabled save', enabled)
      },
    },
  }
}
