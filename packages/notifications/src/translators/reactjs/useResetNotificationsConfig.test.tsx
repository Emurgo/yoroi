import {Notifications} from '@yoroi/types'

import * as React from 'react'
import {act, renderHook, waitFor} from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {QueryClientProvider} from '@tanstack/react-query'

import {NotificationProvider} from './NotificationProvider'
import {useResetNotificationsConfig} from './useResetNotificationsConfig'
import {createManagerMock} from './mocks'
import {queryClientFixture} from '../../fixtures/query-client'

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
