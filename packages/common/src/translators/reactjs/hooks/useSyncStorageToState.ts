import * as React from 'react'
import {App} from '@yoroi/types'

export const useSyncStorageToState = <T, Key extends string = string>(
  keyManager: App.StorageKeyManager<T, Key>,
): [T | null, (newValue: T) => void, () => void] => {
  const [value, setValue] = React.useState<T | null>(() => keyManager.read())

  React.useEffect(() => {
    const subscription = keyManager.subscribe(() =>
      setValue(() => keyManager.read()),
    )

    return () => subscription?.unsubscribe()
  }, [keyManager])

  const save = React.useCallback(
    (newValue: T) => {
      keyManager.save(newValue)
    },
    [keyManager],
  )

  const remove = React.useCallback(() => {
    keyManager.remove()
  }, [keyManager])

  return [value, save, remove]
}
