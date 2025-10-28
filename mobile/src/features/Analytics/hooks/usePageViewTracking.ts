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
) {
  const {trackEvent} = useAnalyticsTracking()

  useFocusEffect(
    React.useCallback(() => {
      trackEvent(event, properties)
    }, [trackEvent, event, properties]),
  )
}

/**
 * Hook for tracking page views with a delay (useful for screens with loading states)
 */
export function useDelayedPageViewTracking<T extends AnalyticsEvent>(
  event: T,
  properties?: T extends keyof AnalyticsEventProperties
    ? AnalyticsEventProperties[T]
    : never,
  delay: number = 500,
) {
  const {trackEvent} = useAnalyticsTracking()

  useFocusEffect(
    React.useCallback(() => {
      const timer = setTimeout(() => {
        trackEvent(event, properties)
      }, delay)

      return () => clearTimeout(timer)
    }, [trackEvent, event, properties, delay]),
  )
}
