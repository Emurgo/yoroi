import * as React from 'react'

export function usePromise<T, A extends unknown[] = []>(
  promise: (...args: A) => Promise<T>,
): UsePromiseResult<T, A>
export function usePromise<T, A extends unknown[] = []>(
  options: UsePromiseOptions<T, A>,
): UsePromiseResult<T, A>
export function usePromise<T, A extends unknown[] = []>(
  promiseOrOptions: ((...args: A) => Promise<T>) | UsePromiseOptions<T, A>,
): UsePromiseResult<T, A> {
  const options =
    typeof promiseOrOptions === 'function'
      ? {promise: promiseOrOptions}
      : promiseOrOptions

  const {promise, onSuccess, onError, onSettled, shouldSuspend, shouldThrow} =
    options

  const [value, setValue] = React.useState<T>()
  const [error, setError] = React.useState<Error>()
  const [isPending, setIsPending] = React.useState(false)
  const [execution, setExecution] = React.useState(0)
  const promiseRef = React.useRef<Promise<T> | null>(null)

  const executeFn = React.useCallback(
    (...args: A) => {
      const newPromise = promise(...args)
      promiseRef.current = newPromise
      setIsPending(true)
      setExecution((p) => p + 1)

      newPromise
        .then((result) => {
          setValue(result)
          onSuccess?.(result)
        })
        .catch((err) => {
          const error = err instanceof Error ? err : new Error(String(err))
          setError(error)
          onError?.(error)
        })
        .finally(() => {
          setIsPending(false)
          promiseRef.current = null
          onSettled?.({value, error})
        })
    },
    [promise, onSuccess, onError, onSettled, value, error],
  )

  if (shouldSuspend && isPending && promiseRef.current) {
    throw promiseRef.current
  }

  if (shouldThrow && error) {
    throw error
  }

  return {
    value,
    error,
    isPending,
    hasError: !!error,
    ok: !isPending && !error && execution > 0,
    resolve: executeFn,
  }
}

export type UsePromiseOptions<T = unknown, A extends unknown[] = []> = {
  promise: (...args: A) => Promise<T>
  onSuccess?: (value: T) => void
  onError?: (error: Error) => void
  onSettled?: ({value, error}: {value?: T; error?: Error}) => void
  shouldSuspend?: boolean
  shouldThrow?: boolean
}

export type UsePromiseResult<T, A extends unknown[] = []> = Readonly<{
  value: T | undefined
  error: Error | undefined
  isPending: boolean
  hasError: boolean
  ok: boolean
  resolve: (...args: A) => void
}>
