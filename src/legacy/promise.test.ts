import {delay, synchronize} from './promise'

it('can delay', async () => {
  expect.assertions(1)

  const DELAY = 500
  const t1 = new Date().getTime()
  await delay(DELAY)
  const t2 = new Date().getTime()
  expect(t2 >= t1 + DELAY).toBe(true)
})

const metafactory = (id, time, order) => () =>
  Promise.resolve().then(async () => {
    order.push(id)
    await delay(time)
    order.push(-id)
    return id
  })

it('nonsynchronized are not synchronized', async () => {
  const order = []
  const factory1 = metafactory(1, 300, order)
  const factory2 = metafactory(2, 200, order)
  const factory3 = metafactory(3, 100, order)

  expect.assertions(2)

  const results = await Promise.all([factory3(), factory2(), factory1()])

  expect(results).toEqual([3, 2, 1])
  expect(order).toEqual([3, 2, 1, -3, -2, -1])
})

it('can synchronize promises', async () => {
  const order = []

  const factory1 = metafactory(1, 300, order)
  const factory2 = metafactory(2, 200, order)
  const factory3 = metafactory(3, 100, order)
  const lock = {lock: null}

  expect.assertions(3)

  const results = await Promise.all([
    synchronize(lock, factory3),
    synchronize(lock, factory2),
    synchronize(lock, factory1),
  ])

  expect(results).toEqual([3, 2, 1])
  expect(order).toEqual([3, -3, 2, -2, 1, -1])
  expect(lock.lock).toBe(null)
})
