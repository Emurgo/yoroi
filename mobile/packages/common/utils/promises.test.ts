import {PromiseAllLimited, runTasks} from './promises'

describe('promises utilities', () => {
  describe('runTasks', () => {
    it('should run tasks concurrently', async () => {
      const tasks = [
        () => Promise.resolve(1),
        () => Promise.resolve(2),
        () => Promise.resolve(3),
      ]
      const results: number[] = []
      for await (const taskResult of runTasks(tasks.values(), 2)) {
        results.push(taskResult)
      }
      expect(results).toHaveLength(3)
      expect(results.sort()).toEqual([1, 2, 3])
    })

    it('should handle empty task list', async () => {
      const results: number[] = []
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const _taskResult of runTasks([].values(), 2)) {
        // Empty task list, no results
      }
      expect(results).toHaveLength(0)
    })
  })

  describe('PromiseAllLimited', () => {
    it('should run tasks with concurrency limit', async () => {
      const tasks = [
        () => Promise.resolve(1),
        () => Promise.resolve(2),
        () => Promise.resolve(3),
      ]
      const results = await PromiseAllLimited(tasks, 2)
      expect(results).toHaveLength(3)
      expect(results.sort()).toEqual([1, 2, 3])
    })

    it('should handle empty task list', async () => {
      const results = await PromiseAllLimited([], 2)
      expect(results).toEqual([])
    })

    it('should reject on task error', async () => {
      const tasks = [
        () => Promise.resolve(1),
        () => Promise.reject(new Error('test')),
      ]
      await expect(PromiseAllLimited(tasks, 2)).rejects.toThrow('test')
    })

    it('should handle error in runTasks', async () => {
      const tasks = [
        () => Promise.resolve(1),
        () => Promise.reject(new Error('test error')),
      ]
      const results: number[] = []
      let errorThrown = false
      try {
        for await (const result of runTasks(tasks.values(), 2)) {
          results.push(result)
        }
      } catch (error) {
        errorThrown = true
        expect(error).toBeInstanceOf(Error)
      }
      expect(errorThrown).toBe(true)
    })
  })
})
