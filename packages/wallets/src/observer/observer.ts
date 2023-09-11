type Subscriber<T> = (data: T) => void

export const observerMaker = <T>(): Observer<T> => {
  const subscribers: Set<Subscriber<T>> = new Set()

  return {
    subscribe: (callback: Subscriber<T>) => {
      subscribers.add(callback)
      return () => {
        subscribers.delete(callback)
      }
    },
    unsubscribe(subscriber: Subscriber<T>) {
      subscribers.delete(subscriber)
    },
    notify: (data: T) => {
      subscribers.forEach((callback) => callback(data))
    },
    destroy: () => {
      subscribers.clear()
    },
  }
}

export type Observer<T> = {
  subscribe: (subscriber: Subscriber<T>) => () => void
  unsubscribe: (subscriber: Subscriber<T>) => void
  notify: (data: T) => void
  destroy: () => void
}
