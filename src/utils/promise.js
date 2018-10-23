// @flow
import ExtendableError from 'es6-error'

export class LockError extends ExtendableError {}

export type Mutex = {
  lock: ?Promise<any>,
}

export const delay = (duration: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, duration)
  })
}

// Try locking mutex, waits if cannot be locked
export const synchronize = <T>(
  mutex: Mutex,
  factory: () => Promise<T>,
): Promise<T> => {
  if (!mutex.lock) {
    // We are first and can grab lock
    const myPromise = factory()
    mutex.lock = myPromise

    // $FlowFixMe
    return myPromise.finally(() => {
      // clean up if we do not have anything waiting on lock
      if (mutex.lock === myPromise) mutex.lock = null
    })
  } else {
    // We need to update lock and at the same time wait for the original
    // function
    const orig = mutex.lock
    let _resolve
    let _reject

    const newLock = new Promise((resolve, reject) => {
      _resolve = resolve
      _reject = reject
    })

    mutex.lock = newLock

    orig.finally(() => {
      // Ok, waiting for the original is done, now let's do our work
      const myPromise = factory()
      myPromise
        .finally(() => {
          // clean up if we do not have anything waiting on lock
          if (mutex.lock === newLock) mutex.lock = null
        })
        .then(_resolve)
        .catch(_reject)
    })
    return ((mutex.lock: any): Promise<T>)
  }
}

export const nonblockingSynchronize = <T>(
  mutex: Mutex,
  factory: () => Promise<T>,
): Promise<T> => {
  if (mutex.lock) throw new LockError()
  return synchronize(mutex, factory)
}
