import {TrackProperties} from '../features/all'

export type MetricsFactoryOptions<T> = {
  apiKey: string
  initialUserId?: string
  options?: T
}

export type Metrics = {
  init(): void
  track(args: TrackProperties): void
  disable(): void
  enable(): void
  setUserId(userId: string): void
  setDeviceId(deviceId: string): void
  setSessionId(sessionId: number): void
}

export type MetricsFactory = <T>(options: MetricsFactoryOptions<T>) => Metrics

export type MetricsStorage = {
  enabled: {
    read(): Promise<boolean>
    remove(): Promise<void>
    save(enabled: boolean): Promise<void>
  }
}
