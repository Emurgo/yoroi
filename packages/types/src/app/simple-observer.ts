export type AppSubscriber<T> = (data: T) => void

export type AppObserver<T> = Readonly<{
  subscribe: (subscriber: AppSubscriber<T>) => () => void
  unsubscribe: (subscriber: AppSubscriber<T>) => void
  notify: (data: T) => void
  destroy: () => void
}>
