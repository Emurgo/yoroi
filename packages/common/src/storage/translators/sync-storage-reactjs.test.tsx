import React from 'react'
import renderer from 'react-test-renderer'

import {SyncStorageProvider, useSyncStorage} from './sync-storage-reactjs' // Update with the actual module path
import {mountMMKVStorage} from '../adapters/mmkv-storage'

const rootStorage = mountMMKVStorage({path: '/'})

describe('SyncStorageProvider and useSyncStorage Tests', () => {
  test('SyncStorageProvider provides storage context', () => {
    const TestComponent = () => {
      const storage = useSyncStorage()
      return <div>{storage ? 'Storage Available' : 'Storage Unavailable'}</div>
    }

    const tree = renderer.create(
      <SyncStorageProvider storage={rootStorage}>
        <TestComponent />
      </SyncStorageProvider>,
    )

    const treeInstance = tree.root
    const textElement = treeInstance.findByType('div')
    expect(textElement.props.children).toBe('Storage Available')
  })

  test('SyncStorageProvider provides the default rootStorage context', () => {
    const TestComponent = () => {
      const storage = useSyncStorage()
      return <div>{storage ? 'Storage Available' : 'Storage Unavailable'}</div>
    }

    const tree = renderer.create(
      <SyncStorageProvider>
        <TestComponent />
      </SyncStorageProvider>,
    )

    const treeInstance = tree.root
    const textElement = treeInstance.findByType('div')
    expect(textElement.props.children).toBe('Storage Available')
  })

  test('useSyncStorage throws error without SyncStorageProvider', () => {
    const InvalidComponent = () => {
      useSyncStorage()
      return <div>Invalid Component</div>
    }

    // Suppress console error caused by the 'invalid' function
    const originalError = console.error
    console.error = jest.fn()

    expect(() => renderer.create(<InvalidComponent />)).toThrow(
      'Missing SyncStorageProvider',
    )

    console.error = originalError
  })
})
