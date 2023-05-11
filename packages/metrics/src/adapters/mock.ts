import {TrackProperties} from '../features/all'
import {FactoryOptions, Metrics} from '../types/metrics'

export function makeMockMetrics({apiKey}: FactoryOptions): Metrics {
  console.debug(apiKey)
  return {
    track: (args: TrackProperties) => {
      console.debug('[metrics] makeMockMetrics track', args)
    },
    disable: () => {
      console.debug('[metrics] makeMockMetrics disable')
    },
    enable: () => {
      console.debug('[metrics] makeMockMetrics enable')
    },
    setDeviceId: (deviceId: string) => {
      console.debug('[metrics] makeMockMetrics setDeviceId', deviceId)
    },
    setSessionId: (sessionId: string) => {
      console.debug('[metrics] makeMockMetrics setSessionId', sessionId)
    },
  }
}
