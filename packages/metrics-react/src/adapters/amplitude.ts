import * as Amplitude from '@amplitude/analytics-browser'
import {Metrics} from '@yoroi/types'

const initialDeps = {analytics: Amplitude} as const

export function makeAmplitudeMetrics(
  {
    apiKey,
    initialUserId,
    options,
  }: Readonly<Metrics.FactoryOptions<Amplitude.Types.BrowserOptions>>,
  deps = initialDeps,
): Readonly<Metrics.Module<Amplitude.Types.EventOptions>> {
  deps.analytics.init(apiKey, initialUserId, options)

  return {
    track: ({event, properties, options: eventOptions}) => {
      deps.analytics.track(event, properties, eventOptions)
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
  } as const as Metrics.Module<Amplitude.Types.EventOptions>
}
