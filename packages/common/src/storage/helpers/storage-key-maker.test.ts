import {App} from '@yoroi/types'
import {storageKeyMaker} from './storage-key-maker'

describe('storageKeyMaker', () => {
  type TestKey = 'test-key'

  const mockStorage: App.ObservableStorage<false, TestKey> = {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    multiSet: jest.fn(),
    multiGet: jest.fn(),
    multiRemove: jest.fn(),
    getAllKeys: jest.fn(),
    join: jest.fn(),
    removeFolder: jest.fn(),
    onChange: jest.fn(),
    observable: {
      source: undefined,
      operator: undefined,
      subscribe: jest.fn(),
      lift: jest.fn(),
      forEach: jest.fn(),
      pipe: jest.fn(),
      toPromise: jest.fn(),
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a storage key maker with identity parser', () => {
    const key = 'test-key' as const
    const value = {data: 'test'}
    const identityParser = (data: unknown) => data as typeof value
    const storage = storageKeyMaker(mockStorage)({key, parser: identityParser})

    storage.save(value)
    expect(mockStorage.setItem).toHaveBeenCalledWith(key, value)
    ;(mockStorage.getItem as jest.Mock).mockImplementation(
      (_k, parse) => parse?.(value) ?? value,
    )
    const result = storage.read()
    expect(mockStorage.getItem).toHaveBeenCalledWith(key, expect.any(Function))
    expect(result).toBe(value)

    storage.remove()
    expect(mockStorage.removeItem).toHaveBeenCalledWith(key)

    expect(storage.key).toBe(key)
  })

  it('should create a storage key maker with custom parser', () => {
    const key = 'test-key' as const
    const value = {data: 'test'}
    const parsedValue = {data: 'parsed'}
    const customParser = jest.fn().mockReturnValue(parsedValue)

    const storage = storageKeyMaker(mockStorage)({
      key,
      parser: customParser,
    })

    storage.save(value)
    expect(mockStorage.setItem).toHaveBeenCalledWith(key, value)
    ;(mockStorage.getItem as jest.Mock).mockImplementation(
      (_k, parse) => parse?.(value) ?? value,
    )
    const result = storage.read()
    expect(mockStorage.getItem).toHaveBeenCalledWith(key, expect.any(Function))
    expect(customParser).toHaveBeenCalledWith(value)
    expect(result).toBe(parsedValue)

    storage.remove()
    expect(mockStorage.removeItem).toHaveBeenCalledWith(key)

    expect(storage.key).toBe(key)
  })

  it('should handle null values from storage', () => {
    const key = 'test-key' as const
    const identityParser = (data: unknown) => data as null
    const storage = storageKeyMaker(mockStorage)({key, parser: identityParser})

    ;(mockStorage.getItem as jest.Mock).mockImplementation(
      (_k, parse) => parse?.(null) ?? null,
    )
    const result = storage.read()
    expect(mockStorage.getItem).toHaveBeenCalledWith(key, expect.any(Function))
    expect(result).toBe(null)
  })

  it('should return frozen object', () => {
    const key = 'test-key' as const
    const identityParser = (data: unknown) => data as unknown
    const storage = storageKeyMaker(mockStorage)({key, parser: identityParser})

    expect(Object.isFrozen(storage)).toBe(true)
  })
})
