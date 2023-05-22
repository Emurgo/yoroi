import {MetricsModule, MetricsFactoryOptions} from './metrics/module'
import {MetricsStorage} from './metrics/storage'
import {MetricsTrack} from './metrics/track'

export namespace Metrics {
  export type Module<EventOptions> = MetricsModule<EventOptions>
  export type FactoryOptions<InitOptions> = MetricsFactoryOptions<InitOptions>

  export type Track<Properties> = MetricsTrack<Properties>

  export type Storage = MetricsStorage
}
