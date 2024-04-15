import {App} from '@yoroi/types'

import {observerMaker} from '../../observer/observer'
import {isString} from '../../utils/parsers'
import {intersection} from '../../utils/arrays'

export const observableStorageMaker = <
  IsAsync extends boolean,
  K extends string,
>(
  storage: App.Storage<IsAsync, K>,
): App.ObservableStorage<IsAsync, K> => {
  const triggers: Array<keyof App.Storage<IsAsync, K>> = [
    'clear',
    // 'removeFolder', can be added later as long the key checks for "/" in the arg when string
    'multiSet',
    'setItem',
    'multiRemove',
    'removeItem',
  ]
  const observable = observerMaker<K[] | null>()

  const onChange = (
    keysToObserve: ReadonlyArray<K>,
    callback: (keysAnnounced: ReadonlyArray<K> | null) => void,
  ) => {
    const wrappedCallback = (keysUpdated: K[] | null) => {
      if (!keysUpdated) {
        callback(null)
      } else {
        const keysToAnnounce = intersection(keysToObserve, keysUpdated)
        if (keysToAnnounce.length > 0) callback(keysToAnnounce)
      }
    }
    return observable.subscribe(wrappedCallback)
  }

  const proxyHandler = {
    get(
      target: App.Storage<IsAsync, K>,
      property: keyof App.Storage<IsAsync, K>,
      receiver: any,
    ) {
      const origProperty = target[property]
      if (typeof origProperty === 'function' && triggers.includes(property)) {
        const origMethod: (...args: any[]) => any = origProperty
        return function (...args: any[]) {
          const notify = () => {
            const [firstArg] = args
            const isArray = Array.isArray(firstArg)
            if (isString(firstArg as K)) {
              // single operations
              observable.notify([firstArg])
            } else if (isArray) {
              // multi operations
              const keys = firstArg as K[]
              observable.notify(keys)
            } else {
              // clear
              observable.notify(null)
            }
          }
          const result: ReturnType<typeof origMethod> = origMethod.apply(
            target,
            args,
          )

          if (result instanceof Promise) {
            return result.then((resolvedValue) => {
              notify()
              return resolvedValue
            })
          } else {
            notify()
            return result
          }
        }
      }

      return Reflect.get(target, property, receiver)
    },
  }

  const proxiedStorage: App.Storage<IsAsync, K> = new Proxy(
    storage,
    proxyHandler,
  )
  return {
    ...proxiedStorage,
    onChange,
  } as const
}

export const observableMultiStorageMaker = <
  T,
  IsAsync extends boolean = true,
  K extends string = string,
>(
  storage: App.MultiStorage<T, IsAsync, K>,
): App.ObservableMultiStorage<T, IsAsync, K> => {
  const triggers: Array<keyof App.MultiStorage<T, IsAsync, K>> = [
    'clear',
    'saveMany',
  ]
  const observable = observerMaker<null>()
  const onChange = (callback: () => void) => observable.subscribe(callback)

  const proxyHandler = {
    get(
      target: App.MultiStorage<T, IsAsync, K>,
      property: keyof App.MultiStorage<T, IsAsync, K>,
      receiver: any,
    ) {
      const origProperty = target[property]
      if (typeof origProperty === 'function' && triggers.includes(property)) {
        const origMethod: (...args: any[]) => any = origProperty
        return function (...args: any[]) {
          const result: ReturnType<typeof origMethod> = origMethod.apply(
            target,
            args,
          )

          if (result instanceof Promise) {
            return result.then((resolvedValue) => {
              observable.notify(null)
              return resolvedValue
            })
          } else {
            observable.notify(null)
            return result
          }
        }
      }

      return Reflect.get(target, property, receiver)
    },
  }

  const proxiedStorage: App.MultiStorage<T, IsAsync, K> = new Proxy(
    storage,
    proxyHandler,
  )
  return {
    ...proxiedStorage,
    onChange,
  } as const
}
