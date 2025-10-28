import {useFocusEffect} from '@react-navigation/native'
import * as React from 'react'

import type {
  AnalyticsEvent,
  AnalyticsEventProperties,
} from '../events/analytics-events'
import {useAnalyticsTracking} from './useAnalyticsTracking'

/**
 * Hook to automatically track page views when a screen comes into focus
 */
export function usePageViewTracking<T extends AnalyticsEvent>(
  event: T,
  properties?: T extends keyof AnalyticsEventProperties
    ? AnalyticsEventProperties[T]
    : never,
  delay: number = 0,
) {
  const {trackEvent} = useAnalyticsTracking()

  useFocusEffect(
    React.useCallback(() => {
      if (delay > 0) {
        const timer = setTimeout(() => {
          trackEvent(event, properties)
        }, delay)
        return () => clearTimeout(timer)
      } else {
        trackEvent(event, properties)
        return () => {}
      }
    }, [trackEvent, event, properties, delay]),
  )
}
