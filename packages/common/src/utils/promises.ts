export async function* runTasks<T>(
  taskIterator: Iterable<() => Promise<T>>,
  maxConcurrency = 3,
): AsyncGenerator<T, void, unknown> {
  async function* workerMaker(): AsyncGenerator<T, void, unknown> {
    for (const task of taskIterator) {
      yield await task()
    }
  }

  const asyncIterators: AsyncGenerator<T, void, unknown>[] = []
  for (let i = 0; i < maxConcurrency; i++) {
    asyncIterators.push(workerMaker())
  }

  yield* raceAsyncIterators(asyncIterators)
}

async function* raceAsyncIterators<T>(
  asyncIterators: AsyncGenerator<T, void, unknown>[],
): AsyncGenerator<T, void, unknown> {
  async function nextResultWithItsIterator(
    iterator: AsyncGenerator<T, void, unknown>,
  ) {
    return {result: await iterator.next(), iterator}
  }

  const promises = new Map<
    AsyncGenerator<T, void, unknown>,
    Promise<{
      result: IteratorResult<T, void>
      iterator: AsyncGenerator<T, void, unknown>
    }>
  >()
  for (const iterator of asyncIterators) {
    promises.set(iterator, nextResultWithItsIterator(iterator))
  }

  while (promises.size) {
    const {result, iterator} = await Promise.race(promises.values())
    if (result.done) {
      promises.delete(iterator)
    } else {
      promises.set(iterator, nextResultWithItsIterator(iterator))
      yield result.value
    }
  }
}

export function PromiseAllLimited<T>(
  taskIterator: Iterable<() => Promise<T>>,
  maxConcurrency = 3,
): Promise<T[]> {
  return new Promise<T[]>((resolve, reject) => {
    const results: T[] = []

    ;(async () => {
      try {
        for await (const result of runTasks(taskIterator, maxConcurrency)) {
          results.push(result)
        }
        resolve(results)
      } catch (error) {
        reject(error)
      }
    })()
  })
}
