import {render, screen} from '@testing-library/react-native'
import * as React from 'react'
import {Text, View} from 'react-native'

import {mountAsyncStorage} from '../adapters/async-storage'
import {AsyncStorageProvider, useAsyncStorage} from './async-storage-reactjs'

const rootStorage = mountAsyncStorage({path: '/'})

describe('AsyncStorageProvider and useAsyncStorage Tests', () => {
  test('AsyncStorageProvider provides storage context', () => {
    const TestComponent = () => {
      const storage = useAsyncStorage()
      return (
        <View>
          <Text>{storage ? 'Storage Available' : 'Storage Unavailable'}</Text>
        </View>
      )
    }

    render(
      <AsyncStorageProvider storage={rootStorage}>
        <TestComponent />
      </AsyncStorageProvider>,
    )

    expect(screen.getByText('Storage Available')).toBeTruthy()
  })

  test('AsyncStorageProvider provides the default rootStorage context', () => {
    const TestComponent = () => {
      const storage = useAsyncStorage()
      return (
        <View>
          <Text>{storage ? 'Storage Available' : 'Storage Unavailable'}</Text>
        </View>
      )
    }

    render(
      <AsyncStorageProvider>
        <TestComponent />
      </AsyncStorageProvider>,
    )

    expect(screen.getByText('Storage Available')).toBeTruthy()
  })

  test('useAsyncStorage throws error without AsyncStorageProvider', () => {
    const InvalidComponent = () => {
      useAsyncStorage()
      return (
        <View>
          <Text>Invalid Component</Text>
        </View>
      )
    }

    expect(() => render(<InvalidComponent />)).toThrow(
      'Missing AsyncStorageProvider',
    )
  })
})
