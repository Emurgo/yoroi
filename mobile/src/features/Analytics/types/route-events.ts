import type {AnalyticsEvent, AnalyticsEventProperties} from './analytics-events'

type TransactionResultsProps =
  AnalyticsEventProperties['Transaction Results Popup Viewed']

export type RouteToEventMap = Record<
  string,
  | AnalyticsEvent
  | {
      event: AnalyticsEvent
      properties?: TransactionResultsProps | undefined
    }
  | undefined
>
