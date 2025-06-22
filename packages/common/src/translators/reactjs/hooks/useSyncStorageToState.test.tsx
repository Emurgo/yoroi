import {App} from '@yoroi/types'

import {renderHook, act, waitFor} from '@testing-library/react'

import {useSyncStorageToState} from './useSyncStorageToState'
import {storageKeyMaker} from '../../../storage/helpers/storage-key-maker'

type TestKey = 'test-key'
type TestValue = {data: string}

describe('useSyncStorageToState', () => {
  const mockUnsubscribe = jest.fn()
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
    onChange: jest.fn().mockReturnValue({unsubscribe: mockUnsubscribe}),
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

  const createKeyManager = (key: TestKey) => {
    const keyManager: App.StorageKeyManager<TestValue, TestValue, TestKey> = {
      key,
      subscribe: jest.fn(() => {
        return {unsubscribe: mockUnsubscribe, closed: false} as any
      }),
      read: () => {
        const value = mockStorage.getItem(key, (item: string | null) => {
          if (!item) return null
          try {
            return JSON.parse(item)
          } catch {
            return null
          }
        })
        return value as TestValue
      },
      save: (value: TestValue) => {
        mockStorage.setItem(key, value)
      },
      remove: () => {
        mockStorage.removeItem(key)
      },
    }
    return keyManager
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with null value', async () => {
    const key = 'test-key' as const
    const keyManager = createKeyManager(key)
    ;(mockStorage.getItem as jest.Mock).mockReturnValue(null)
    const {result} = renderHook(() => useSyncStorageToState(keyManager))

    await waitFor(() => {
      expect(result.current[0]).toBe(null)
    })
  })

  it('should read initial value from storage', () => {
    const key = 'test-key' as const
    const value: TestValue = {data: 'test'}
    const keyManager = createKeyManager(key)

    ;(mockStorage.getItem as jest.Mock).mockImplementation((k, parse) => {
      if (k === key) {
        return parse ? parse(JSON.stringify(value)) : value
      }
      return null
    })

    const {result} = renderHook(() => useSyncStorageToState(keyManager))

    expect(mockStorage.getItem).toHaveBeenCalledWith(key, expect.any(Function))
    expect(result.current[0]).toEqual(value)
  })

  it('should update value when storage changes', () => {
    const key = 'test-key' as const
    const initialValue: TestValue = {data: 'initial'}
    const newValue: TestValue = {data: 'updated'}
    let subscribeCallback: (() => void) | undefined
    const keyManager = {
      ...createKeyManager(key),
      subscribe: jest.fn((cb) => {
        subscribeCallback = cb
        return {unsubscribe: mockUnsubscribe, closed: false} as any
      }),
    }

    ;(mockStorage.getItem as jest.Mock).mockImplementation((k, parse) => {
      if (k === key) {
        return parse ? parse(JSON.stringify(initialValue)) : initialValue
      }
      return null
    })

    const {result} = renderHook(() => useSyncStorageToState(keyManager))

    // Simulate storage change
    ;(mockStorage.getItem as jest.Mock).mockImplementation((k, parse) => {
      if (k === key) {
        return parse ? parse(JSON.stringify(newValue)) : newValue
      }
      return null
    })
    act(() => {
      if (subscribeCallback) {
        subscribeCallback()
      }
    })

    return waitFor(() => {
      expect(result.current[0]).toEqual(newValue)
    })
  })

  it('should save value to storage', () => {
    const key = 'test-key' as const
    const value: TestValue = {data: 'test'}
    const keyManager = createKeyManager(key)

    const {result} = renderHook(() => useSyncStorageToState(keyManager))

    act(() => {
      const save = result.current[1]
      if (typeof save === 'function') {
        save(value)
      }
    })

    expect(mockStorage.setItem).toHaveBeenCalledWith(key, value)
  })

  it('should remove value from storage', () => {
    const key = 'test-key' as const
    const keyManager = createKeyManager(key)

    const {result} = renderHook(() => useSyncStorageToState(keyManager))

    act(() => {
      const remove = result.current[2]
      if (typeof remove === 'function') {
        remove()
      }
    })

    expect(mockStorage.removeItem).toHaveBeenCalledWith(key)
  })

  it('should unsubscribe when unmounted', () => {
    const key = 'test-key' as const
    const keyManager = createKeyManager(key)

    const {unmount} = renderHook(() => useSyncStorageToState(keyManager))
    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('should call storage.onChange with correct arguments when subscribing', () => {
    const key = 'test-key' as const
    const parser = (data: unknown) => (data ? JSON.parse(data as string) : null)
    const keyManager = storageKeyMaker(mockStorage)<TestValue>({key, parser})

    renderHook(() => useSyncStorageToState(keyManager))

    expect(mockStorage.onChange).toHaveBeenCalledWith(
      [key],
      expect.any(Function),
    )
  })
})
