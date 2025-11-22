import {App} from '@yoroi/types'

import {act, renderHook} from '@testing-library/react'
import {Subject, Subscription} from 'rxjs'

import {useSyncStorageToState} from './useSyncStorageToState'

describe('useSyncStorageToState', () => {
  it('should initialize with storage value', () => {
    const unsubscribe = jest.fn()
    const keyManager: App.StorageKeyManager<string, string, 'test-key'> = {
      key: 'test-key',
      read: jest.fn(() => 'initial'),
      save: jest.fn(),
      remove: jest.fn(),
      subscribe: jest.fn(() => ({unsubscribe}) as unknown as Subscription),
    }

    const {result} = renderHook(() => useSyncStorageToState(keyManager))

    expect(result.current[0]).toBe('initial')
    expect(keyManager.read).toHaveBeenCalled()
  })

  it('should update state when storage changes', () => {
    const subject$ = new Subject<void>()
    const keyManager: App.StorageKeyManager<string, string, 'test-key'> = {
      key: 'test-key',
      read: jest.fn(() => 'initial'),
      save: jest.fn(),
      remove: jest.fn(),
      subscribe: jest.fn((callback) => {
        return subject$.subscribe(callback)
      }),
    }

    const {result} = renderHook(() => useSyncStorageToState(keyManager))

    ;(keyManager.read as jest.Mock).mockReturnValue('updated')

    act(() => {
      subject$.next()
    })

    expect(result.current[0]).toBe('updated')
  })

  it('should save value when save is called', () => {
    const unsubscribe = jest.fn()
    const keyManager: App.StorageKeyManager<string, string, 'test-key'> = {
      key: 'test-key',
      read: jest.fn(() => 'initial'),
      save: jest.fn(),
      remove: jest.fn(),
      subscribe: jest.fn(() => ({unsubscribe}) as unknown as Subscription),
    }

    const {result} = renderHook(() => useSyncStorageToState(keyManager))

    act(() => {
      result.current[1]('new value')
    })

    expect(keyManager.save).toHaveBeenCalledWith('new value')
  })

  it('should remove value when remove is called', () => {
    const unsubscribe = jest.fn()
    const keyManager: App.StorageKeyManager<string, string, 'test-key'> = {
      key: 'test-key',
      read: jest.fn(() => 'initial'),
      save: jest.fn(),
      remove: jest.fn(),
      subscribe: jest.fn(() => ({unsubscribe}) as unknown as Subscription),
    }

    const {result} = renderHook(() => useSyncStorageToState(keyManager))

    act(() => {
      result.current[2]()
    })

    expect(keyManager.remove).toHaveBeenCalled()
  })

  it('should cleanup subscription on unmount', () => {
    const unsubscribe = jest.fn()
    const keyManager: App.StorageKeyManager<string, string, 'test-key'> = {
      key: 'test-key',
      read: jest.fn(() => 'initial'),
      save: jest.fn(),
      remove: jest.fn(),
      subscribe: jest.fn(() => ({unsubscribe}) as unknown as Subscription),
    }

    const {unmount} = renderHook(() => useSyncStorageToState(keyManager))

    unmount()

    expect(unsubscribe).toHaveBeenCalled()
  })
})
