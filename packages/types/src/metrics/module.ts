import {MetricsTrack} from './track'

export type MetricsFactoryOptions<T> = {
  apiKey: string
  initialUserId?: string
  options?: T
}

export type MetricsModule<EventOptions> = {
  track(args: MetricsTrack<EventOptions>): void
  disable(): void
  enable(): void
  setUserId(userId: string): void
  setDeviceId(deviceId: string): void
  setSessionId(sessionId: number): void
}
