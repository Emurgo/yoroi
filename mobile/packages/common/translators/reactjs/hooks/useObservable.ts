import * as React from 'react'
import {BehaviorSubject} from 'rxjs'

import {useObservableValue} from './useObservableValue'

/**
 * Hook to subscribe to a BehaviorSubject and get its current value.
 * This is a convenience wrapper for BehaviorSubject observables.
 *
 * **Usage**:
 * ```tsx
 * const selectedWalletId = useObservable(walletManager.selectedWalletId$)
 * ```
 *
 * **Note**: For observables that emit events but you need to read a different value,
 * use `useObservableValue` with a getter function instead.
 *
 * **Performance**: Uses `useSyncExternalStore` internally for optimal performance.
 * Prevents double renders on mount (unlike useState + useEffect).
 */
export function useObservable<T>(observable$: BehaviorSubject<T>): T {
  const getter = React.useCallback(() => {
    return observable$.value
  }, [observable$])

  // Use the BehaviorSubject's observable directly as the trigger
  // It will emit whenever the value changes
  return useObservableValue({
    observable$: observable$.asObservable(),
    getter,
  })
}
