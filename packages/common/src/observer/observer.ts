import {App} from '@yoroi/types'
import {freeze} from 'immer'

export const observerMaker = <T>(): App.Observer<T> => {
  const subscribers: Set<App.Subscriber<T>> = new Set()

  return freeze(
    {
      subscribe: (callback: App.Subscriber<T>) => {
        subscribers.add(callback)
        return () => {
          subscribers.delete(callback)
        }
      },
      unsubscribe(subscriber: App.Subscriber<T>) {
        subscribers.delete(subscriber)
      },
      notify: (data: T) => {
        subscribers.forEach((callback) => callback(data))
      },
      destroy: () => {
        subscribers.clear()
      },
    },
    true,
  )
}
