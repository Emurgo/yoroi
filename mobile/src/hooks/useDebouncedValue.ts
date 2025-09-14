import {time} from '@yoroi/common'

import * as React from 'react'

const initialDelay = time.seconds(0.5)

export const useDebouncedValue = <T>(value: T, delay = initialDelay): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef?.current)
    }
  }, [value, delay])

  return debouncedValue
}
