export type CaptureDataFn = (
  event: string,
  properties?: Record<string, string | number | boolean | null | string[]>,
) => void

export interface AnalyticsProvider {
  navigate: (to: string) => void
  capture: CaptureDataFn
  install: (campaign: string, source: string) => void
  identify: (
    userId?: string,
    traits?: Record<string, string | number | boolean | null | string[]>,
  ) => void
}

export type MetricsEnabledStorage = {
  save: (value: boolean) => void
}
