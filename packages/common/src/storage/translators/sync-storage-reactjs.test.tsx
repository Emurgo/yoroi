import React from 'react'
import {render, screen} from '@testing-library/react-native'
import {View, Text} from 'react-native'

import {SyncStorageProvider, useSyncStorage} from './sync-storage-reactjs'
import {mountMMKVStorage} from '../adapters/mmkv-storage'

const rootStorage = mountMMKVStorage({path: '/'})

describe('SyncStorageProvider and useSyncStorage Tests', () => {
  test('SyncStorageProvider provides storage context', () => {
    const TestComponent = () => {
      const storage = useSyncStorage()
      return (
        <View>
          <Text>{storage ? 'Storage Available' : 'Storage Unavailable'}</Text>
        </View>
      )
    }

    render(
      <SyncStorageProvider storage={rootStorage}>
        <TestComponent />
      </SyncStorageProvider>,
    )

    expect(screen.getByText('Storage Available')).toBeTruthy()
  })

  test('SyncStorageProvider provides the default rootStorage context', () => {
    const TestComponent = () => {
      const storage = useSyncStorage()
      return (
        <View>
          <Text>{storage ? 'Storage Available' : 'Storage Unavailable'}</Text>
        </View>
      )
    }

    render(
      <SyncStorageProvider>
        <TestComponent />
      </SyncStorageProvider>,
    )

    expect(screen.getByText('Storage Available')).toBeTruthy()
  })

  test('useSyncStorage throws error without SyncStorageProvider', () => {
    const InvalidComponent = () => {
      useSyncStorage()
      return (
        <View>
          <Text>Invalid Component</Text>
        </View>
      )
    }

    expect(() => render(<InvalidComponent />)).toThrow(
      'Missing SyncStorageProvider',
    )
  })
})
