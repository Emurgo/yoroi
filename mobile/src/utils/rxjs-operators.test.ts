import {of, throwError, timer} from 'rxjs'
import {delay, take} from 'rxjs/operators'

import {
  catchAndLog,
  catchWithDefault,
  debounce,
  filterNullish,
  retryWithBackoff,
  retryWithDelay,
  simpleRetry,
  throttle,
} from './rxjs-operators'

describe('rxjs-operators', () => {
  describe('debounce', () => {
    it('should debounce values', (done) => {
      const source = of(1, 2, 3).pipe(delay(10))
      let count = 0
      source.pipe(debounce(50)).subscribe({
        next: (value) => {
          count++
          expect(value).toBe(3) // Only last value should pass through
        },
        complete: () => {
          expect(count).toBe(1)
          done()
        },
      })
    })
  })

  describe('throttle', () => {
    it('should throttle values', (done) => {
      const source = timer(0, 10).pipe(take(5))
      let count = 0
      source.pipe(throttle(50)).subscribe({
        next: () => count++,
        complete: () => {
          expect(count).toBeGreaterThan(0)
          expect(count).toBeLessThan(5)
          done()
        },
      })
    })
  })

  describe('retryWithBackoff', () => {
    it('should retry with exponential backoff', (done) => {
      let attempts = 0
      const source = new (require('rxjs').Observable)((subscriber: any) => {
        attempts++
        if (attempts < 3) {
          subscriber.error(new Error('Failed'))
        } else {
          subscriber.next('Success')
          subscriber.complete()
        }
      })

      source.pipe(retryWithBackoff(3, 10, 100)).subscribe({
        next: (value) => {
          expect(value).toBe('Success')
          expect(attempts).toBe(3)
          done()
        },
        error: () => done.fail('Should not error'),
      })
    })
  })

  describe('retryWithDelay', () => {
    it('should retry with fixed delay', (done) => {
      let attempts = 0
      const source = new (require('rxjs').Observable)((subscriber: any) => {
        attempts++
        if (attempts < 2) {
          subscriber.error(new Error('Failed'))
        } else {
          subscriber.next('Success')
          subscriber.complete()
        }
      })

      source.pipe(retryWithDelay(2, 10)).subscribe({
        next: (value) => {
          expect(value).toBe('Success')
          expect(attempts).toBe(2)
          done()
        },
        error: () => done.fail('Should not error'),
      })
    })
  })

  describe('simpleRetry', () => {
    it('should retry immediately', (done) => {
      let attempts = 0
      const source = new (require('rxjs').Observable)((subscriber: any) => {
        attempts++
        if (attempts < 2) {
          subscriber.error(new Error('Failed'))
        } else {
          subscriber.next('Success')
          subscriber.complete()
        }
      })

      source.pipe(simpleRetry(2)).subscribe({
        next: (value) => {
          expect(value).toBe('Success')
          expect(attempts).toBe(2)
          done()
        },
        error: () => done.fail('Should not error'),
      })
    })
  })

  describe('catchAndLog', () => {
    it('should catch and log errors', (done) => {
      const errorHandler = jest.fn()
      throwError(() => new Error('Test error'))
        .pipe(catchAndLog(errorHandler))
        .subscribe({
          next: () => done.fail('Should not emit'),
          error: () => done.fail('Should not error'),
          complete: () => {
            expect(errorHandler).toHaveBeenCalled()
            done()
          },
        })
    })
  })

  describe('catchWithDefault', () => {
    it('should return default value on error', (done) => {
      throwError(() => new Error('Test error'))
        .pipe(catchWithDefault('default'))
        .subscribe({
          next: (value) => {
            expect(value).toBe('default')
            done()
          },
          error: () => done.fail('Should not error'),
        })
    })
  })

  describe('filterNullish', () => {
    it('should filter out null and undefined', (done) => {
      const source = of(1, null, 2, undefined, 3)
      const values: number[] = []
      source.pipe(filterNullish()).subscribe({
        next: (value) => values.push(value),
        complete: () => {
          expect(values).toEqual([1, 2, 3])
          done()
        },
      })
    })
  })
})
