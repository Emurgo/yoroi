import * as React from 'react'

export const useAsync = <T>({
  execute,
  onSuccess,
  onError,
  onSettled,
  withSuspense = false,
  withThrow = false,
  enabled = true,
  initialValue,
}: UseAsyncOptions<T>): UseAsyncResult<T> | T => {
  const [value, setValue] = React.useState(initialValue)
  const [error, setError] = React.useState<Error>()
  const [isPending, setIsPending] = React.useState(enabled)

  const executeFn = React.useCallback(() => {
    if (!enabled) return Promise.resolve(undefined as T)
    return execute()
  }, [execute, enabled])

  const resource = React.useMemo<Resource<T>>(
    () => ({
      read: () => {
        if (error) {
          if (withThrow) throw error
          return undefined as T
        }
        if (value) return value
        throw executeFn()
      },
    }),
    [value, error, executeFn, withThrow],
  )

  React.useEffect(() => {
    let isMounted = true

    const resolve = async () => {
      if (!enabled) {
        setIsPending(false)
        return
      }

      try {
        setIsPending(true)
        const result = await executeFn()

        if (isMounted) {
          setValue(result)
          onSuccess?.(result)
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error(String(err))
          setError(error)
          onError?.(error)
          if (withThrow) throw error
        }
      } finally {
        if (isMounted) {
          setIsPending(false)
          onSettled?.()
        }
      }
    }

    resolve()

    return () => {
      isMounted = false
    }
  }, [executeFn, onSuccess, onError, onSettled, enabled, withThrow])

  if (withSuspense) {
    if (!enabled) {
      return undefined as T
    }
    return resource.read()
  }

  return {
    value,
    error,
    isPending,
    hasError: !!error,
    done: !isPending && enabled,
    ok: !isPending && !error && enabled,
  }
}

export type UseAsyncOptions<T> = {
  execute: () => Promise<T>
  onSuccess?: (value: T) => void
  onError?: (error: Error) => void
  onSettled?: () => void
  withSuspense?: boolean
  withThrow?: boolean
  enabled?: boolean
  initialValue?: T
}

export type UseAsyncResult<T> = Readonly<{
  value: T | undefined
  error: Error | undefined
  isPending: boolean
  hasError: boolean
  done: boolean
  ok: boolean
}>

type Resource<T> = {
  read: () => T
}
