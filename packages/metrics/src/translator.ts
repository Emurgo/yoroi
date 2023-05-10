import { InitOptions, MetricsAdapter } from './adapter'

export const Metrics: MetricsAdapter = {
  track: () => {
    console.log('Logger :: Metrics :: track()')
  },
  init: ({ apiKey, identity }: InitOptions) => {
    console.log('Logger :: Metrics :: init()', apiKey, identity)
  },
}
