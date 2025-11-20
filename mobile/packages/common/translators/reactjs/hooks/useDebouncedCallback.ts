import * as React from 'react'

/**
 * Debounces a callback function, skipping the first render by default.
 * Useful for search inputs and other user-triggered actions where you don't
 * want the callback to fire on initial mount.
 *
 * @param callback - The function to debounce
 * @param value - The value to watch for changes (triggers debounce)
 * @param delay - Delay in milliseconds (default: 1000ms)
 * @param skipFirst - Whether to skip the first render (default: true)
 *
 * @example
 * ```ts
 * // Re-enable error text after user stops typing
 * const [errorTextEnabled, setErrorTextEnabled] = React.useState(errorOnMount)
 *
 * useDebouncedCallback(
 *   () => setErrorTextEnabled(true),
 *   value,
 *   errorDelay || 1000
 * )
 * ```
 */
export const useDebouncedCallback = (
  callback: VoidFunction,
  value: unknown,
  delay = 1000,
  skipFirst = true,
) => {
  const first = React.useRef(skipFirst)

  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }

    const timer = setTimeout(() => {
      callback()
    }, delay)

    return () => clearTimeout(timer)
  }, [callback, delay, value])
}

