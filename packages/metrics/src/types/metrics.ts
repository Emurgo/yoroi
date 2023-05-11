import {TrackProperties} from '../features/all'

export type MetricsFactoryOptions = {
  apiKey: string
}

export type Metrics = {
  init(): void
  track(args: TrackProperties): void
  disable(): void
  enable(): void
  setDeviceId(deviceId: string): void
  setSessionId(sessionId: number): void
}

export type MetricsFactory = (options: MetricsFactoryOptions) => Metrics

export type MetricsStorage = {
  enabled: {
    read(): Promise<boolean>
    remove(): Promise<void>
    save(enabled: boolean): Promise<void>
  }
}
