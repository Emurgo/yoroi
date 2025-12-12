import * as React from 'react'
import {Observable} from 'rxjs'

/**
 * Hook to subscribe to an RxJS Observable and get its current value.
 * Uses `useSyncExternalStore` for optimal performance and to prevent double renders.
 *
 * **IMPORTANT**: The `getter` function should read the current value from the source,
 * not from the observable event. This ensures we always get the latest value.
 *
 * **Usage**:
 * ```tsx
 * const balance = useObservableValue({
 *   observable$: wallet.balance$,
 *   getter: () => wallet.primaryBalance,
 * })
 * ```
 *
 * **Performance**: Uses `useSyncExternalStore` which:
 * - Prevents double renders on mount (unlike useState + useEffect)
 * - Only re-renders when the observable emits
 * - Properly handles concurrent rendering
 *
 * **NOTE**: If you need to perform side effects when the observable emits,
 * subscribe directly to the observable instead of using this hook.
 *
 * **NOTE**: Remember to pass a stable `getter` function (use `useCallback`)
 * to avoid unnecessary re-renders.
 */
export function useObservableValue<E, T>({
  observable$,
  getter,
}: {
  observable$: Observable<E>
  getter: () => T
}) {
  // Cache the last snapshot value to ensure stability
  // useSyncExternalStore requires getSnapshot to return stable references
  // Initialize with the current value
  const snapshotRef = React.useRef<T>(getter())

  // Use useSyncExternalStore for optimal performance
  // This prevents double renders and properly handles concurrent rendering
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const subscription = observable$.subscribe(() => {
        // Update the cached snapshot when observable emits
        snapshotRef.current = getter()
        onStoreChange()
      })
      return () => subscription.unsubscribe()
    },
    [observable$, getter],
  )

  const getSnapshot = React.useCallback(() => {
    // Return the cached value to ensure stability
    // React may call this multiple times, so we return the cached value
    return snapshotRef.current
  }, [])

  // Get the current value synchronously (for initial render and after updates)
  const getServerSnapshot = React.useCallback(() => {
    return getter()
  }, [getter])

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
