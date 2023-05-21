import * as Amplitude from '@amplitude/analytics-node'
import {MetricsFactoryOptions, Metrics, TrackProperties} from '@yoroi/types'

const initialDeps = {analytics: Amplitude} as const

export function makeAmplitudeMetrics(
  {
    apiKey,
    options,
  }: Readonly<
    Omit<MetricsFactoryOptions<Amplitude.Types.NodeOptions>, 'initialUserId'>
  >,
  deps = initialDeps,
): Metrics {
  deps.analytics.init(apiKey, options)

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
    setUserId: (_: string) => {
      throw new Error('Not supported for amplitude-node')
    },
    setDeviceId: (_: string) => {
      throw new Error('Not supported for amplitude-node')
    },
    setSessionId: (_: number) => {
      throw new Error('Not supported for amplitude-node')
    },
  } as const
}
