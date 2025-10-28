import * as React from 'react'

import {useAnalyticsContext} from '../context/AnalyticsRootProvider'
import type {
  AnalyticsEvent,
  AnalyticsEventProperties,
} from '../events/analytics-events'

export function useAnalyticsTracking() {
  const {capture} = useAnalyticsContext()

  const trackEvent = React.useCallback(
    <T extends AnalyticsEvent>(
      event: T,
      properties?: T extends keyof AnalyticsEventProperties
        ? AnalyticsEventProperties[T]
        : never,
    ) => {
      capture(
        event,
        properties as Record<
          string,
          string | number | boolean | null | string[]
        >,
      )
    },
    [capture],
  )

  return {
    trackEvent,
  }
}
