import * as React from 'react'

import {useAppState} from './useAppState'

export function useBackgroundTimer({after, execute}: Props) {
  const bgTimeRef = React.useRef<number | null>(null)

  useAppState({
    on: 'background',
    execute: () => {
      bgTimeRef.current = Date.now()
    },
  })

  useAppState({
    on: 'active',
    execute: () => {
      if (bgTimeRef.current !== null) {
        const timeSpentInBg = Date.now() - bgTimeRef.current
        if (timeSpentInBg >= after) execute()
      }
      bgTimeRef.current = null
    },
  })
}

type Props = {
  after: number
  execute: () => void
}
