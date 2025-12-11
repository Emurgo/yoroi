import * as React from 'react'

import {time} from '../../../time/time'

const initialDelay = time.seconds(0.5)

/**
 * Debounces a value, returning the debounced value after the specified delay.
 * Useful for search inputs and other scenarios where you want to delay updates.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * ```ts
 * const [search, setSearch] = React.useState('')
 * const debouncedSearch = useDebouncedValue(search, 300)
 *
 * // debouncedSearch will update 300ms after user stops typing
 * ```
 */
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
