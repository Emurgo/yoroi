import {Observable, Observer, Subscription} from 'rxjs'

export type AppSubscriber<T> = Partial<Observer<T>> | ((value: T) => void)

export type AppObserverManager<T> = Readonly<{
  subscribe: (observerOrNext: AppSubscriber<T>) => Subscription
  unsubscribe: (subscription: Subscription) => void
  notify: (value: T) => void
  destroy: () => void
  observable: Observable<T>
}>

export type AppObserverSubscribe<T> = (
  subscriber: AppSubscriber<T>,
) => Subscription
