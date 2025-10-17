import * as React from 'react'

import {useBackgroundTimerState} from './BackgroundTimerContext'
import {useAppState} from './useAppState'

export function useBackgroundTimer({after, execute}: Props) {
  const bgTimeRef = React.useRef<number | null>(null)
  const isDisabled = useBackgroundTimerState()

  useAppState({
    on: 'background',
    execute: () => {
      // Only record timestamp if timer is active
      if (!isDisabled) {
        bgTimeRef.current = Date.now()
      }
    },
  })

  useAppState({
    on: 'active',
    execute: () => {
      // Check background time only if we have a timestamp and timer is active
      if (bgTimeRef.current !== null && !isDisabled) {
        const timeSpentInBg = Date.now() - bgTimeRef.current
        if (timeSpentInBg >= after) execute()
      }

      // ALWAYS clear timestamp when returning to active state
      // This prevents stale timestamps from persisting across state changes
      // Even if timer was disabled, we need to clear any recorded timestamp
      bgTimeRef.current = null
    },
  })
}

type Props = {
  after: number
  execute: () => void
}
