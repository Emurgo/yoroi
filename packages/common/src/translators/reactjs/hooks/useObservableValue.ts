import * as React from 'react'
import {Observable} from 'rxjs'

// for some reason React.useSyncExternalStore is not working properly
// pass stable executor & filter to avoid re-renderings
export function useObservableValue<E, T>({
  observable$,
  executor,
}: {
  observable$: Observable<E>
  executor: () => T
}) {
  const [value, setValue] = React.useState<T>(executor())

  React.useEffect(() => {
    const subscription = observable$.subscribe(() => {
      setValue(() => executor())
    })
    return () => subscription.unsubscribe()
  }, [executor, observable$])

  return value
}
