import * as Amplitude from '@amplitude/analytics-browser'
import {Metrics, MetricsFactoryOptions, TrackProperties} from '@yoroi/types'

const initialDeps = {analytics: Amplitude} as const

export function makeAmplitudeMetrics(
  {
    apiKey,
    initialUserId,
    options,
  }: Readonly<MetricsFactoryOptions<Amplitude.Types.BrowserOptions>>,
  deps = initialDeps,
): Metrics {
  deps.analytics.init(apiKey, initialUserId, options)

  return {
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
