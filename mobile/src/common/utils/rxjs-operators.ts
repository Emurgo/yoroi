import {
  Observable,
  OperatorFunction,
  catchError,
  debounceTime,
  delay,
  retry,
  retryWhen,
  switchMap,
  throttleTime,
  throwError,
  timer,
} from 'rxjs'

/**
 * Reusable RxJS Operators
 * Common operators for async state management patterns
 */

// ============================================================================
// Debouncing & Throttling
// ============================================================================

/**
 * Debounce operator with configurable delay
 * Useful for search inputs, API calls triggered by user input
 *
 * @param delayMs - Delay in milliseconds
 * @example
 * ```ts
 * searchInput$.pipe(debounce(300)).subscribe(...)
 * ```
 */
export const debounce = <T>(delayMs: number): OperatorFunction<T, T> =>
  debounceTime(delayMs)

/**
 * Throttle operator with configurable delay
 * Useful for limiting update frequency (e.g., balance updates)
 *
 * @param delayMs - Delay in milliseconds
 * @example
 * ```ts
 * balanceUpdates$.pipe(throttle(400)).subscribe(...)
 * ```
 */
export const throttle = <T>(delayMs: number): OperatorFunction<T, T> =>
  throttleTime(delayMs)

// ============================================================================
// Retry Logic
// ============================================================================

/**
 * Retry operator with exponential backoff
 * Useful for network requests that may fail temporarily
 *
 * @param maxRetries - Maximum number of retries
 * @param baseDelayMs - Base delay in milliseconds (doubles each retry)
 * @param maxDelayMs - Maximum delay in milliseconds
 * @example
 * ```ts
 * apiCall$.pipe(retryWithBackoff(3, 1000, 10000)).subscribe(...)
 * ```
 */
export const retryWithBackoff = <T>(
  maxRetries: number = 3,
  baseDelayMs: number = 1000,
  maxDelayMs: number = 10000,
): OperatorFunction<T, T> => {
  return retryWhen((errors) =>
    errors.pipe(
      switchMap((error, index) => {
        const retryAttempt = index + 1
        if (retryAttempt > maxRetries) {
          return throwError(() => error)
        }
        const delayMs = Math.min(baseDelayMs * Math.pow(2, index), maxDelayMs)
        return timer(delayMs)
      }),
    ),
  )
}

/**
 * Retry operator with fixed delay
 * Simpler retry logic for cases where backoff isn't needed
 *
 * @param maxRetries - Maximum number of retries
 * @param delayMs - Delay between retries in milliseconds
 * @example
 * ```ts
 * apiCall$.pipe(retryWithDelay(3, 500)).subscribe(...)
 * ```
 */
export const retryWithDelay = <T>(
  maxRetries: number = 3,
  delayMs: number = 1000,
): OperatorFunction<T, T> => {
  return retryWhen((errors) =>
    errors.pipe(
      switchMap((error, index) => {
        if (index >= maxRetries) {
          return throwError(() => error)
        }
        return timer(delayMs)
      }),
    ),
  )
}

/**
 * Simple retry operator (no delay)
 * For immediate retries
 *
 * @param count - Number of retries
 * @example
 * ```ts
 * apiCall$.pipe(simpleRetry(2)).subscribe(...)
 * ```
 */
export const simpleRetry = <T>(count: number): OperatorFunction<T, T> =>
  retry(count)

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Catch and log errors without breaking the stream
 * Useful for non-critical operations
 *
 * @param onError - Optional error handler
 * @example
 * ```ts
 * stream$.pipe(catchAndLog((error) => logger.error(error))).subscribe(...)
 * ```
 */
export const catchAndLog = <T>(
  onError?: (error: unknown) => void,
): OperatorFunction<T, T> => {
  return catchError((error) => {
    onError?.(error)
    // Return empty observable to complete the stream
    return new Observable<T>((subscriber) => {
      subscriber.complete()
    })
  })
}

/**
 * Catch and return a default value
 * Useful for providing fallback data
 *
 * @param defaultValue - Default value to return on error
 * @example
 * ```ts
 * apiCall$.pipe(catchWithDefault([])).subscribe(...)
 * ```
 */
export const catchWithDefault = <T>(
  defaultValue: T,
): OperatorFunction<T, T> => {
  return catchError(() => {
    return new Observable<T>((subscriber) => {
      subscriber.next(defaultValue)
      subscriber.complete()
    })
  })
}

// ============================================================================
// Utility Operators
// ============================================================================

/**
 * Delay operator for adding artificial delays
 * Useful for testing or rate limiting
 *
 * @param delayMs - Delay in milliseconds
 * @example
 * ```ts
 * stream$.pipe(delayed(100)).subscribe(...)
 * ```
 */
export const delayed = <T>(delayMs: number): OperatorFunction<T, T> =>
  delay(delayMs)

/**
 * Filter out null/undefined values
 * Useful for cleaning up streams
 *
 * @example
 * ```ts
 * stream$.pipe(filterNullish()).subscribe(...)
 * ```
 */
export const filterNullish = <T>(): OperatorFunction<
  T | null | undefined,
  T
> => {
  return (source: Observable<T | null | undefined>) =>
    new Observable<T>((subscriber) => {
      const subscription = source.subscribe({
        next: (value) => {
          if (value != null) {
            subscriber.next(value)
          }
        },
        error: (error) => subscriber.error(error),
        complete: () => subscriber.complete(),
      })
      return () => subscription.unsubscribe()
    })
}
