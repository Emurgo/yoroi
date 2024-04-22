import {queueTaskMaker} from './queue-task'

describe('queueTaskMaker', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should enqueue and execute tasks in order', async () => {
    const queue = queueTaskMaker()

    const task1 = jest.fn().mockResolvedValue(undefined)
    const task2 = jest.fn().mockResolvedValue(undefined)
    const task3 = jest.fn().mockResolvedValue(undefined)

    queue.enqueue(task1)
    queue.enqueue(task2)
    queue.enqueue(task3)

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(task1).toHaveBeenCalledTimes(1)
    expect(task2).toHaveBeenCalledTimes(1)
    expect(task3).toHaveBeenCalledTimes(1)
  })

  it('should destroy the queue and stop executing tasks', async () => {
    const queue = queueTaskMaker()

    const task1 = jest.fn().mockResolvedValue(undefined)
    const task2 = jest.fn().mockResolvedValue(undefined)

    queue.destroy()

    queue.enqueue(task1)
    queue.enqueue(task2)

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(task1).not.toHaveBeenCalled()
    expect(task2).not.toHaveBeenCalled()
  })

  it('should continue on error', async () => {
    const queue = queueTaskMaker()

    const task1 = jest.fn().mockRejectedValue(new Error())
    const task2 = jest.fn().mockResolvedValue(undefined)

    queue.enqueue(task1)
    queue.enqueue(task2)

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(task1).toHaveBeenCalledTimes(1)
    expect(task2).toHaveBeenCalledTimes(1)
  })
})
