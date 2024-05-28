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
  const tasks = [
    () => new Promise((resolve) => setTimeout(() => resolve(1), 100)),
    () => new Promise((resolve) => setTimeout(() => resolve(2), 100)),
    () => new Promise((resolve) => setTimeout(() => resolve(3), 100)),
    () => new Promise((resolve) => setTimeout(() => resolve(4), 100)),
    () => new Promise((resolve) => setTimeout(() => resolve(5), 100)),
  ]

  it('should limit concurrent tasks and resolve with all results', async () => {
    const results = await PromiseAllLimited(tasks, 2)
    expect(results).toEqual([1, 2, 3, 4, 5])
  })

  it('should limit with default the tasks and resolve with all results', async () => {
    const results = await PromiseAllLimited(tasks)
    expect(results).toEqual([1, 2, 3, 4, 5])
  })

  it('should handle task errors', async () => {
    await expect(
      PromiseAllLimited(
        [() => new Promise((_, reject) => reject(new Error('Task failed')))],
        2,
      ),
    ).rejects.toThrow('Task failed')
  })
})
