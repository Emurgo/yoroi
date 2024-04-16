import {App} from '@yoroi/types'
import {freeze} from 'immer'
import {Subject, Subscription} from 'rxjs'

export const observerMaker = <T>(): App.ObserverManager<T> => {
  const eventSubject = new Subject<T>()

  return freeze({
    subscribe: (observer: App.Subscriber<T>): Subscription => {
      return eventSubject.subscribe(observer)
    },
    unsubscribe: (subscription: Subscription) => {
      subscription.unsubscribe()
    },
    notify: (value: T) => {
      eventSubject.next(value)
    },
    destroy: () => {
      eventSubject.complete()
    },
    observable: eventSubject.asObservable(),
  })
}
