import {App} from '@yoroi/types'
import {observerMaker} from '../../observer/observer'
import {isString} from '../../helpers/parsers'
import {intersection} from '../../helpers/arrays'

export const observableStorageMaker = <IsAsync extends boolean>(
  storage: App.Storage<IsAsync>,
): App.ObservableStorage<IsAsync> => {
  const triggers: Array<keyof App.Storage<IsAsync>> = [
    'clear',
    // 'removeFolder', can be added later as long the key checks for "/" in the arg when string
    'multiSet',
    'setItem',
    'multiRemove',
    'removeItem',
  ]
  const observable = observerMaker<string[] | null>()

  const onUpdate = (
    keysToObserve: ReadonlyArray<string>,
    callback: (keysAnnounced: ReadonlyArray<string> | null) => void,
  ) => {
    const wrappedCallback = (keysUpdated: string[] | null) => {
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
      target: App.Storage<IsAsync>,
      property: keyof App.Storage<IsAsync>,
      receiver: any,
    ) {
      const origProperty = target[property]
      if (typeof origProperty === 'function' && triggers.includes(property)) {
        const origMethod: (...args: any[]) => any = origProperty
        return function (...args: any[]) {
          const notify = () => {
            const [firstArg] = args
            const isArray = Array.isArray(firstArg)
            if (isString(firstArg)) {
              // single operations
              observable.notify([firstArg])
            } else if (isArray) {
              // multi operations
              const keys = firstArg as string[]
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

  const proxiedStorage: App.Storage<IsAsync> = new Proxy(storage, proxyHandler)
  return {
    ...proxiedStorage,
    onUpdate,
  } as const
}

export const observableMultiStorageMaker = <T, IsAsync extends boolean>(
  storage: App.MultiStorage<T, IsAsync>,
): App.ObservableMultiStorage<T, IsAsync> => {
  const triggers: Array<keyof App.MultiStorage<T, IsAsync>> = [
    'clear',
    'saveMany',
  ]
  const observable = observerMaker<null>()
  const onUpdate = (callback: () => void) => observable.subscribe(callback)

  const proxyHandler = {
    get(
      target: App.MultiStorage<T, IsAsync>,
      property: keyof App.MultiStorage<T, IsAsync>,
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

  const proxiedStorage: App.MultiStorage<T, IsAsync> = new Proxy(
    storage,
    proxyHandler,
  )
  return {
    ...proxiedStorage,
    onUpdate,
  } as const
}
