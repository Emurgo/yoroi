import React from 'react'
import renderer from 'react-test-renderer'

import {AsyncStorageProvider, useAsyncStorage} from './async-storage-reactjs' // Update with the actual module path
import {mountAsyncStorage} from '../adapters/async-storage'

const rootStorage = mountAsyncStorage({path: '/'})

describe('AsyncStorageProvider and useAsyncStorage Tests', () => {
  test('AsyncStorageProvider provides storage context', () => {
    const TestComponent = () => {
      const storage = useAsyncStorage()
      return <div>{storage ? 'Storage Available' : 'Storage Unavailable'}</div>
    }

    const tree = renderer.create(
      <AsyncStorageProvider storage={rootStorage}>
        <TestComponent />
      </AsyncStorageProvider>,
    )

    const treeInstance = tree.root
    const textElement = treeInstance.findByType('div')
    expect(textElement.props.children).toBe('Storage Available')
  })

  test('AsyncStorageProvider provides the default rootStorage context', () => {
    const TestComponent = () => {
      const storage = useAsyncStorage()
      return <div>{storage ? 'Storage Available' : 'Storage Unavailable'}</div>
    }

    const tree = renderer.create(
      <AsyncStorageProvider>
        <TestComponent />
      </AsyncStorageProvider>,
    )

    const treeInstance = tree.root
    const textElement = treeInstance.findByType('div')
    expect(textElement.props.children).toBe('Storage Available')
  })

  test('useAsyncStorage throws error without AsyncStorageProvider', () => {
    const InvalidComponent = () => {
      useAsyncStorage()
      return <div>Invalid Component</div>
    }

    // Suppress console error caused by the 'invalid' function
    const originalError = console.error
    console.error = jest.fn()

    expect(() => renderer.create(<InvalidComponent />)).toThrow(
      'Missing AsyncStorageProvider',
    )

    console.error = originalError
  })
})
