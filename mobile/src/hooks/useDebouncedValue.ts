import {time} from '@yoroi/common'

import * as React from 'react'

const initialDelay = time.seconds(0.4)

export const useDebouncedValue = <T>(value: T, delay = initialDelay): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      clearTimeout(handler)
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
