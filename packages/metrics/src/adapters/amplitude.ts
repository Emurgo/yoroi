import * as Amplitude from '../proxies/amplitude-client'

import {TrackProperties} from '../features/all'
import {MetricsFactoryOptions, Metrics} from '../types/metrics'

const initialDeps = {analytics: Amplitude} as const

export function makeAmplitudeMetrics<
  T extends Amplitude.Types.ReactNativeOptions | Amplitude.Types.BrowserOptions,
>(
  {apiKey, initialUserId, options}: Readonly<MetricsFactoryOptions<T>>,
  deps = initialDeps,
): Metrics {
  deps.analytics.init(apiKey)

  return {
    init: () => {
      deps.analytics.init(apiKey, initialUserId, options)
    },
    track: ({event, properties}: TrackProperties) => {
      deps.analytics.track(event, properties)
    },
    disable: () => {
      deps.analytics.setOptOut(true)
    },
    enable: () => {
      deps.analytics.setOptOut(false)
    },
    setUserId: (userId: string) => {
      deps.analytics.setUserId(userId)
    },
    setDeviceId: (deviceId: string) => {
      deps.analytics.setDeviceId(deviceId)
    },
    setSessionId: (sessionId: number) => {
      deps.analytics.setSessionId(sessionId)
    },
  } as const
}
