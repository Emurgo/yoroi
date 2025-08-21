import {Notifications} from '@yoroi/types'

import AsyncStorage from '@react-native-async-storage/async-storage'
import {QueryClientProvider} from '@tanstack/react-query'
import {act, renderHook, waitFor} from '@testing-library/react-native'
import * as React from 'react'

import {queryClientFixture} from '../../fixtures/query-client'
import {NotificationProvider} from './NotificationProvider'
import {createManagerMock} from './mocks'
import {useResetNotificationsConfig} from './useResetNotificationsConfig'

describe('useResetNotificationsConfig', () => {
  beforeEach(() => AsyncStorage.clear())

  it('should allow to reset config', async () => {
    const client = queryClientFixture()
    const manager = createManagerMock()

    const wrapper = ({children}: {children: React.ReactNode}) => (
      <QueryClientProvider client={client}>
        <NotificationProvider manager={manager}>
          {children}
        </NotificationProvider>
      </QueryClientProvider>
    )
    const {result} = renderHook(() => useResetNotificationsConfig(), {
      wrapper,
    })
    await manager.config.save({
      ...(await manager.config.read()),
      [Notifications.Trigger.TransactionReceived]: {
        notify: false,
      },
    })
    act(() => {
      result.current.mutate()
    })

    await waitFor(async () =>
      expect(result.current.data).toEqual(await manager.config.read()),
    )
  })
})
