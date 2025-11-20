/**
 * Creates a debounced function that delays invoking callback until after delay milliseconds
 * have elapsed since the last time it was invoked.
 *
 * This is a non-React utility for debouncing function calls outside of React hooks.
 * For React hooks, use `useDebouncedCallback` instead.
 *
 * @example
 * ```ts
 * const { call, clear } = debounce((value: string) => {
 *   console.log(value)
 * }, 300)
 *
 * call('hello') // Will be debounced
 * call('world') // Cancels previous call, schedules new one
 * clear() // Cancel any pending calls
 * ```
 */
export const debounce = <T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const clear = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const call = (...args: Parameters<T>) => {
    clear()

    timeoutId = setTimeout(() => {
      callback(...args)
    }, delay)
  }

  return {
    clear,
    call,
  } as const
}

