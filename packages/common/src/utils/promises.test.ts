import {PromiseAllLimited, runTasks} from './promises'

describe('runTasks', () => {
  it('should run tasks with limited concurrency', async () => {
    const taskResults: number[] = []
    const taskIterator = function* () {
      for (let i = 1; i <= 5; i++) {
        yield async () => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          taskResults.push(i)
          return i
        }
      }
    }

    const results: number[] = []
    for await (const result of runTasks(taskIterator(), 2)) {
      results.push(result)
    }

    expect(results).toEqual([1, 2, 3, 4, 5])
    expect(taskResults).toEqual([1, 2, 3, 4, 5])
  })

  it('should run tasks with limited concurrency (default)', async () => {
    const taskResults: number[] = []
    const taskIterator = function* () {
      for (let i = 1; i <= 5; i++) {
        yield async () => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          taskResults.push(i)
          return i
        }
      }
    }

    const results: number[] = []
    for await (const result of runTasks(taskIterator())) {
      results.push(result)
    }

    expect(results).toEqual([1, 2, 3, 4, 5])
    expect(taskResults).toEqual([1, 2, 3, 4, 5])
  })
})

describe('PromiseAllLimited', () => {
  it('should limit concurrent tasks and resolve with all results', async () => {
    const taskIterator = function* () {
      for (let i = 1; i <= 5; i++) {
        yield async () => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          return i
        }
      }
    }

    const results = await PromiseAllLimited(taskIterator(), 2)
    expect(results).toEqual([1, 2, 3, 4, 5])
  })

  it('should limit with default the tasks and resolve with all results', async () => {
    const taskIterator = function* () {
      for (let i = 1; i <= 5; i++) {
        yield async () => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          return i
        }
      }
    }

    const results = await PromiseAllLimited(taskIterator())
    expect(results).toEqual([1, 2, 3, 4, 5])
  })

  it('should handle task errors', async () => {
    const taskIterator = function* () {
      yield async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        throw new Error('Task failed')
      }
      yield async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return 1
      }
    }

    await expect(PromiseAllLimited(taskIterator(), 2)).rejects.toThrow(
      'Task failed',
    )
  })
})
