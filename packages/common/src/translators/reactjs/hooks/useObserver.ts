import * as React from 'react'
import {Observable} from 'rxjs'

// for some reason React.useSyncExternalStore is not working properly
export function useObserver<E, T>({
  observable,
  executor,
}: {
  observable: Observable<E>
  executor: () => T
}) {
  // calling executor to populate state to enqueue dispatch render
  const [isPending, startTransition] = React.useTransition()
  const [data, setData] = React.useState<T>(executor())

  React.useEffect(() => {
    const subscription = observable.subscribe(() =>
      startTransition(() => setData(() => executor())),
    )
    return () => subscription.unsubscribe()
  }, [executor, observable])

  return React.useMemo(
    () => ({
      data,
      isPending,
    }),
    [data, isPending],
  )
}
