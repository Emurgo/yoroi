import {TrackProperties} from './properties'

export type MetricsFactoryOptions<T> = {
  apiKey: string
  initialUserId?: string
  options?: T
}

export type Metrics = {
  track(args: TrackProperties): void
  disable(): void
  enable(): void
  setUserId(userId: string): void
  setDeviceId(deviceId: string): void
  setSessionId(sessionId: number): void
}

export type MetricsFactory = <T>(options: MetricsFactoryOptions<T>) => Metrics
