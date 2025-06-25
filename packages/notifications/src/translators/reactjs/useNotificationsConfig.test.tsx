import * as React from 'react'
import {renderHook, waitFor} from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {QueryClientProvider} from '@tanstack/react-query'

import {useNotificationsConfig} from './useNotificationsConfig'
import {NotificationProvider} from './NotificationProvider'
import {createManagerMock} from './mocks'
import {queryClientFixture} from '../../fixtures/query-client'

describe('useNotificationsConfig', () => {
  beforeEach(() => AsyncStorage.clear())

  it('should return notifications config', async () => {
    const client = queryClientFixture()
    const manager = createManagerMock()

    const wrapper = ({children}: {children: React.ReactNode}) => (
      <QueryClientProvider client={client}>
        <NotificationProvider manager={manager}>
          {children}
        </NotificationProvider>
      </QueryClientProvider>
    )
    const {result} = renderHook(() => useNotificationsConfig(), {wrapper})
    await waitFor(async () =>
      expect(result.current.data).toEqual(await manager.config.read()),
    )
  })
})
