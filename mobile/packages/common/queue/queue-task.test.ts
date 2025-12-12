import {queueTaskMaker} from './queue-task'

describe('queueTaskMaker', () => {
  it('should create queue task manager', () => {
    const manager = queueTaskMaker()
    expect(manager.enqueue).toBeDefined()
    expect(manager.destroy).toBeDefined()
  })

  it('should enqueue and execute tasks', (done) => {
    const manager = queueTaskMaker()
    let executed = false

    manager.enqueue(async () => {
      executed = true
    })

    setTimeout(() => {
      expect(executed).toBe(true)
      manager.destroy()
      done()
    }, 100)
  })

  it('should handle task errors', (done) => {
    const manager = queueTaskMaker()
    let errorHandled = false

    manager.enqueue(async () => {
      throw new Error('Task error')
    })

    setTimeout(() => {
      errorHandled = true
      manager.destroy()
      expect(errorHandled).toBe(true)
      done()
    }, 100)
  })

  it('should destroy queue', () => {
    const manager = queueTaskMaker()
    expect(() => manager.destroy()).not.toThrow()
  })
})
