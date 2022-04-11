/* eslint-disable @typescript-eslint/no-explicit-any */
import ExtendableError from 'es6-error'
import pLimit from 'p-limit'

import {Logger} from './logging'
export class IsLockedError extends ExtendableError {}
export type Mutex = {
  lock: Promise<any> | null | undefined
}
// reexport under better name
export const limitConcurrency = pLimit
export const delay = (duration: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}
// Try locking mutex, waits if cannot be locked
export const synchronize = <T>(mutex: Mutex, factory: () => Promise<T>): Promise<T> => {
  Logger.debug('Synchronize on', mutex)

  if (!mutex.lock) {
    Logger.debug('Synchronize lock fastpath')
    // We are first and can grab lock
    const myPromise = factory()
    mutex.lock = myPromise
    return myPromise.finally(() => {
      Logger.debug('Synchronize unlock fastpath')
      // clean up if we do not have anything waiting on lock
      if (mutex.lock === myPromise) mutex.lock = null
    })
  } else {
    Logger.debug('Synchronize lock wait')
    // We need to update lock and at the same time wait for the original
    // function
    const orig: Promise<unknown> = mutex.lock as any

    let _resolve

    let _reject

    const newLock = new Promise((resolve, reject) => {
      _resolve = resolve
      _reject = reject
    })
    mutex.lock = newLock
    // note: don't await on purpose
    orig.finally(() => {
      Logger.debug('Synchronize lock resume')
      // Ok, waiting for the original is done, now let's do our work
      const myPromise = factory()
      myPromise
        .finally(() => {
          // clean up if we do not have anything waiting on lock
          Logger.debug('Synchronize unlock')
          if (mutex.lock === newLock) mutex.lock = null
        })
        .then(_resolve)
        .catch(_reject)
    })
    return mutex.lock as any as Promise<T>
  }
}
export const nonblockingSynchronize = <T>(mutex: Mutex, factory: () => Promise<T>): Promise<T> => {
  if (mutex.lock) throw new IsLockedError()
  return synchronize(mutex, factory)
}
