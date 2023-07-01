import {isEmpty} from 'lodash'

export function isEmptyString(value: string | null | undefined): value is '' | null | undefined {
  return isEmpty(value)
}

export function promiseAny<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise((resolve, reject) => {
    let rejectedCount = 0
    for (const promise of promises) {
      promise.then(resolve).catch(() => {
        rejectedCount++
        if (rejectedCount === promises.length) {
          reject(new Error('All promises were rejected'))
        }
      })
    }
  })
}
