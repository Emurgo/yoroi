import * as React from 'react'

import {useBackgroundTimerState} from './BackgroundTimerContext'
import {useAppState} from './useAppState'

export function useBackgroundTimer({after, execute}: Props) {
  const bgTimeRef = React.useRef<number | null>(null)
  const isDisabled = useBackgroundTimerState()

  useAppState({
    on: 'background',
    execute: () => {
      if (!isDisabled) {
        bgTimeRef.current = Date.now()
      }
    },
  })

  useAppState({
    on: 'active',
    execute: () => {
      if (bgTimeRef.current !== null && !isDisabled) {
        const timeSpentInBg = Date.now() - bgTimeRef.current
        if (timeSpentInBg >= after) execute()
        bgTimeRef.current = null
      }
    },
  })
}

type Props = {
  after: number
  execute: () => void
}
