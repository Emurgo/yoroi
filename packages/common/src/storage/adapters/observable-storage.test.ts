import {App} from '@yoroi/types'
import {
  observableMultiStorageMaker,
  observableStorageMaker,
} from './observable-storage'

describe('observableStorageMaker', () => {
  beforeEach(() => jest.resetAllMocks())

  it('mmkv - should notify observers when storage methods are called', () => {
    const storage: App.Storage<false> = {
      clear: jest.fn(),
      multiSet: jest.fn(),
      setItem: jest.fn(),
      multiRemove: jest.fn(),
      removeItem: jest.fn(),
      getAllKeys: jest.fn(),
      join: jest.fn(),
      getItem: jest.fn(),
      multiGet: jest.fn(),
      removeFolder: jest.fn(),
    }
    const observerCallback = jest.fn()

    const observableStorage = observableStorageMaker(storage)

    const client1 = observableStorage.onChange(
      ['key1', 'key2'],
      observerCallback,
    )

    observableStorage.clear()
    expect(observerCallback).toHaveBeenCalledWith(null)

    observableStorage.setItem('key1', 'value1')
    expect(observerCallback).toHaveBeenCalledWith(['key1'])

    observableStorage.multiRemove(['key1', 'key2'])
    expect(observerCallback).toHaveBeenCalledWith(['key1', 'key2'])

    // untracked keys
    observableStorage.multiSet([
      ['key3', 'valu3'],
      ['key4', 'value4'],
    ])

    client1.unsubscribe()
    expect(storage.clear).toHaveBeenCalled()
    expect(storage.setItem).toHaveBeenCalledWith('key1', 'value1')
    expect(storage.multiRemove).toHaveBeenCalledWith(['key1', 'key2'])
  })

  it('async = should notify observers when storage promises are invoked', async () => {
    const storage: App.Storage<true> = {
      clear: jest.fn().mockResolvedValue(undefined),
      multiSet: jest.fn().mockResolvedValue(undefined),
      setItem: jest.fn().mockResolvedValue(undefined),
      multiRemove: jest.fn().mockResolvedValue(undefined),
      removeItem: jest.fn().mockResolvedValue(undefined),
      getAllKeys: jest.fn().mockResolvedValue([]),
      join: jest.fn().mockResolvedValue(undefined),
      getItem: jest.fn().mockResolvedValue(undefined),
      multiGet: jest.fn().mockResolvedValue(undefined),
      removeFolder: jest.fn().mockResolvedValue(undefined),
    }
    const observerCallback = jest.fn()

    const observableStorage = observableStorageMaker(storage)

    const client1 = observableStorage.onChange(
      ['key1', 'key2'],
      observerCallback,
    )

    await observableStorage.clear()
    expect(observerCallback).toHaveBeenCalledWith(null)

    await observableStorage.setItem('key1', 'value1')
    expect(observerCallback).toHaveBeenCalledWith(['key1'])

    await observableStorage.multiRemove(['key1', 'key2'])
    expect(observerCallback).toHaveBeenCalledWith(['key1', 'key2'])

    // untracked keys
    await observableStorage.multiSet([
      ['key3', 'valu3'],
      ['key4', 'value4'],
    ])

    client1.unsubscribe()
    expect(storage.clear).toHaveBeenCalled()
    expect(storage.setItem).toHaveBeenCalledWith('key1', 'value1')
    expect(storage.multiRemove).toHaveBeenCalledWith(['key1', 'key2'])
    expect(storage.multiSet).toHaveBeenCalledWith([
      ['key3', 'valu3'],
      ['key4', 'value4'],
    ])
  })
})

describe('observableMultiStorageMaker', () => {
  beforeEach(() => jest.resetAllMocks())

  it('mmkv - should notify observers when storage methods are called', () => {
    const storage: App.MultiStorage<{id: string; value: string}, false> = {
      clear: jest.fn(),
      getAllKeys: jest.fn(),
      readAll: jest.fn(),
      readMany: jest.fn(),
      saveMany: jest.fn(),
      removeMany: jest.fn(),
    }
    const observerCallback = jest.fn()

    const observableStorage = observableMultiStorageMaker(storage)

    const client1 = observableStorage.onChange(observerCallback)

    observableStorage.clear()
    expect(observerCallback).toHaveBeenCalledWith(null)

    observableStorage.saveMany([{id: 'key1', value: 'value1'}])
    expect(observerCallback).toHaveBeenCalledWith(null)

    client1.unsubscribe()
    expect(storage.clear).toHaveBeenCalled()
    expect(storage.saveMany).toHaveBeenCalledWith([
      {id: 'key1', value: 'value1'},
    ])
  })

  it('async = should notify observers when storage promises are invoked', async () => {
    const storage: App.MultiStorage<{id: string; value: string}, true> = {
      clear: jest.fn().mockResolvedValue(undefined),
      getAllKeys: jest.fn().mockResolvedValue([]),
      readAll: jest.fn().mockResolvedValue([]),
      readMany: jest.fn().mockResolvedValue([]),
      saveMany: jest.fn().mockResolvedValue(undefined),
      removeMany: jest.fn().mockResolvedValue(undefined),
    }
    const observerCallback = jest.fn()

    const observableStorage = observableMultiStorageMaker(storage)

    const client1 = observableStorage.onChange(observerCallback)

    await observableStorage.clear()
    expect(observerCallback).toHaveBeenCalledWith(null)

    await observableStorage.saveMany([{id: 'key1', value: 'value1'}])
    expect(observerCallback).toHaveBeenCalledWith(null)

    client1.unsubscribe()
    expect(storage.clear).toHaveBeenCalled()
    expect(storage.saveMany).toHaveBeenCalledWith([
      {id: 'key1', value: 'value1'},
    ])
  })
})
