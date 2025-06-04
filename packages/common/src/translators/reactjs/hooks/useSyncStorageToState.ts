import {App} from '@yoroi/types'

import * as React from 'react'

/**
 * @description
 * This hook is used to sync a storage key to a state.
 * Important: T is the type returned by the parser function of the key manager.
 * Therefore if you don't want a undefined / prefer a null, or even a initial value.
 * Use the parser function of the key manager to handle it.
 */
export const useSyncStorageToState = <T, K extends string>(
  keyManager: App.StorageKeyManager<T, K>,
): [T, (newValue: T) => void, () => void] => {
  const [value, setValue] = React.useState<T>(() => keyManager.read())

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
