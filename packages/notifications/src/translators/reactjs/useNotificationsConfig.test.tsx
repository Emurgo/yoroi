import * as React from 'react'
import {renderHook, waitFor} from '@testing-library/react-native'
import {useNotificationsConfig} from './useNotificationsConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {queryClientFixture} from '@yoroi/common'
import {NotificationProvider} from './NotificationProvider'
import {QueryClientProvider} from 'react-query'
import {createManagerMock} from './mocks'

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
