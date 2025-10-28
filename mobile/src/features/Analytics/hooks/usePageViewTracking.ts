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

  const eventRef = React.useRef(event)
  const propertiesRef = React.useRef(properties)
  const delayRef = React.useRef(delay)

  React.useEffect(() => {
    eventRef.current = event
  }, [event])

  React.useEffect(() => {
    propertiesRef.current = properties
  }, [properties])

  React.useEffect(() => {
    delayRef.current = delay
  }, [delay])

  useFocusEffect(
    React.useCallback(() => {
      const d = delayRef.current ?? 0
      if (d > 0) {
        const timer = setTimeout(() => {
          trackEvent(
            eventRef.current as T,
            propertiesRef.current as typeof properties,
          )
        }, d)
        return () => clearTimeout(timer)
      }
      trackEvent(
        eventRef.current as T,
        propertiesRef.current as typeof properties,
      )
      return () => {}
    }, [trackEvent]),
  )
}
