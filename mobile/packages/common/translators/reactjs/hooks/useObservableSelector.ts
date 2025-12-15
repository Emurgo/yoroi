import {Observable} from 'rxjs'

import {useObservableValue} from './useObservableValue'

/**
 * Hook to subscribe to an Observable and derive/select a value from it.
 * This is useful for computed/derived state that depends on observable values.
 *
 * **Usage**:
 * ```tsx
 * const primaryBalance = useObservableSelector(
 *   wallet.balance$,
 *   () => wallet.primaryBalance, // Read from source, not from event
 * )
 * ```
 *
 * **Performance**: Uses `useSyncExternalStore` internally for optimal performance.
 * The selector function should be memoized with `useCallback` if it has dependencies.
 *
 * **Note**: The selector should read from the source object (like `useObservableValue`'s getter),
 * not from the observable's emitted value. This ensures we always get the latest value.
 *
 * @param observable$ - The observable to subscribe to (triggers re-renders)
 * @param selector - Function that derives a value from the source (not from the event)
 * @returns The selected/derived value
 */
export function useObservableSelector<E, T>(
  observable$: Observable<E>,
  selector: () => T,
): T {
  return useObservableValue({
    observable$,
    getter: selector,
  })
}
