import * as Amplitude from '@amplitude/analytics-node'
import {Metrics} from '@yoroi/types'

const initialDeps = {analytics: Amplitude} as const

export function makeAmplitudeMetrics(
  {
    apiKey,
    options,
  }: Readonly<
    Omit<Metrics.FactoryOptions<Amplitude.Types.NodeOptions>, 'initialUserId'>
  >,
  deps = initialDeps,
): Readonly<Metrics.Module<Amplitude.Types.EventOptions>> {
  deps.analytics.init(apiKey, options)

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
    setUserId: () => {
      throw new Error('Not supported for amplitude-node')
    },
    setDeviceId: () => {
      throw new Error('Not supported for amplitude-node')
    },
    setSessionId: () => {
      throw new Error('Not supported for amplitude-node')
    },
  } as const as Metrics.Module<Amplitude.Types.EventOptions>
}
