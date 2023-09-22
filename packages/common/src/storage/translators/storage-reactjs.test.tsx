import React from 'react'
import renderer from 'react-test-renderer'

import {StorageProvider, useStorage} from './storage-reactjs' // Update with the actual module path
import {rootStorage} from '../adapters/rootStorage'

describe('StorageProvider and useStorage Tests', () => {
  test('StorageProvider provides storage context', () => {
    const TestComponent = () => {
      const storage = useStorage()
      return <div>{storage ? 'Storage Available' : 'Storage Unavailable'}</div>
    }

    const tree = renderer.create(
      <StorageProvider storage={rootStorage}>
        <TestComponent />
      </StorageProvider>,
    )

    const treeInstance = tree.root
    const textElement = treeInstance.findByType('div')
    expect(textElement.props.children).toBe('Storage Available')
  })

  test('StorageProvider provides the default rootStorage context', () => {
    const TestComponent = () => {
      const storage = useStorage()
      return <div>{storage ? 'Storage Available' : 'Storage Unavailable'}</div>
    }

    const tree = renderer.create(
      <StorageProvider>
        <TestComponent />
      </StorageProvider>,
    )

    const treeInstance = tree.root
    const textElement = treeInstance.findByType('div')
    expect(textElement.props.children).toBe('Storage Available')
  })

  test('useStorage throws error without StorageProvider', () => {
    const InvalidComponent = () => {
      useStorage()
      return <div>Invalid Component</div>
    }

    // Suppress console error caused by the 'invalid' function
    const originalError = console.error
    console.error = jest.fn()

    expect(() => renderer.create(<InvalidComponent />)).toThrow(
      'Missing StorageProvider',
    )

    console.error = originalError
  })
})
