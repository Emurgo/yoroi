import * as React from 'react'
import {Observable} from 'rxjs'

/**
 * For some reason `React.useSyncExternalStore` is not working properly
 * **please remember to pass a stable `executor` to avoid re-renderings** e.g `React.useCallback...`
 *
 * **ATTENTION** useObservableValue was designed to mimic `useSyncExternalStore`
 * the executor should read the data from the source and not from the event
 * so basically it means -> something changes, please updated with the latest data
 *
 * **NOTE** if the data from the event is desired to perform some action, please subscribe directly
 * and don't use this hook
 *
 * **NOTE** be mindful that if the observer is a behavior subject, the hook will update twice when mounting
 * 1st on the value intialization and
 * 2nd after subscribing to the observable (cuz it will emit the last value, when present)
 */
export function useObservableValue<E, T>({
  observable$,
  getter,
}: {
  observable$: Observable<E>
  getter: () => T
}) {
  const [value, setValue] = React.useState<T>(getter())

  React.useEffect(() => {
    const subscription = observable$.subscribe(() => {
      setValue(() => getter())
    })
    return () => subscription.unsubscribe()
  }, [getter, observable$])

  return value
}
