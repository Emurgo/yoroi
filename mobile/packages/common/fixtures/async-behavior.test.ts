import {asyncBehavior} from './async-behavior'

describe('asyncBehavior', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('success', () => {
    it('should resolve with data immediately', async () => {
      const promise = asyncBehavior.success('test-data')
      await expect(promise).resolves.toBe('test-data')
    })
  })

  describe('loading', () => {
    it('should return a promise that never resolves', async () => {
      const promise = asyncBehavior.loading()
      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve('timeout'), 100),
      )

      jest.advanceTimersByTime(1000)

      const result = await Promise.race([promise, timeoutPromise])
      expect(result).toBe('timeout')
    })
  })

  describe('error', () => {
    it('should reject with default error', async () => {
      const promise = asyncBehavior.error()
      await expect(promise).rejects.toThrow('Unknown error')
    })

    it('should reject with custom error', async () => {
      const customError = new Error('Custom error')
      const promise = asyncBehavior.error(customError)
      await expect(promise).rejects.toThrow('Custom error')
    })
  })

  describe('empty', () => {
    it('should resolve with empty representation', async () => {
      const promise = asyncBehavior.empty([])
      await expect(promise).resolves.toEqual([])
    })
  })

  describe('delayed', () => {
    it('should resolve after timeout', async () => {
      const promise = asyncBehavior.delayed({
        data: 'delayed-data',
        timeout: 1000,
      })

      jest.advanceTimersByTime(500)
      let resolved = false
      promise.then(() => {
        resolved = true
      })
      expect(resolved).toBe(false)

      jest.advanceTimersByTime(500)
      await promise
      expect(resolved).toBe(true)
    })

    it('should use default timeout', async () => {
      const promise = asyncBehavior.delayed({data: 'delayed-data'})

      jest.advanceTimersByTime(3000)
      await expect(promise).resolves.toBe('delayed-data')
    })
  })

  describe('maker', () => {
    it('should create async behavior with custom functions', () => {
      const behavior = asyncBehavior.maker({
        data: 'test',
        timeout: 2000,
        emptyRepresentation: null,
      })

      expect(behavior.success).toBeDefined()
      expect(behavior.loading).toBeDefined()
      expect(behavior.error).toBeDefined()
      expect(behavior.empty).toBeDefined()
      expect(behavior.delayed).toBeDefined()
    })

    it('should include custom error handlers', () => {
      const customError = () => Promise.reject(new Error('Custom'))
      const behavior = asyncBehavior.maker({
        data: 'test',
        emptyRepresentation: null,
        otherErrors: {custom: customError},
      })

      expect(behavior.error.custom).toBe(customError)
      expect(behavior.error.unknown).toBeDefined()
    })

    it('should call success with data', async () => {
      const behavior = asyncBehavior.maker({
        data: 'test-data',
        emptyRepresentation: null,
      })

      const result = await behavior.success()
      expect(result).toBe('test-data')
    })

    it('should call empty with representation', async () => {
      const behavior = asyncBehavior.maker({
        data: 'test',
        emptyRepresentation: [],
      })

      const result = await behavior.empty()
      expect(result).toEqual([])
    })

    it('should call delayed with custom timeout', async () => {
      const behavior = asyncBehavior.maker({
        data: 'delayed',
        timeout: 1500,
        emptyRepresentation: null,
      })

      const promise = behavior.delayed()
      jest.advanceTimersByTime(1500)
      await expect(promise).resolves.toBe('delayed')
    })
  })
})
