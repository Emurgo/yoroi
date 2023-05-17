import * as Amplitude from '../proxies/amplitude-client'

import {TrackProperties} from '../features/all'
import {MetricsFactoryOptions, Metrics} from '../types/metrics'

const initialDeps = {analytics: Amplitude} as const

export function makeAmplitudeMetrics(
  {apiKey}: Readonly<MetricsFactoryOptions>,
  deps = initialDeps,
): Metrics {
  deps.analytics.init(apiKey)

  return {
    init: () => {
      deps.analytics.init(apiKey)
    },
    track: ({event, metadata}: TrackProperties) => {
      deps.analytics.track(event, metadata)
    },
    disable: () => {
      deps.analytics.setOptOut(true)
    },
    enable: () => {
      deps.analytics.setOptOut(false)
    },
    setDeviceId: (deviceId: string) => {
      deps.analytics.setDeviceId(deviceId)
    },
    setSessionId: (sessionId: number) => {
      deps.analytics.setSessionId(sessionId)
    },
  } as const
}
