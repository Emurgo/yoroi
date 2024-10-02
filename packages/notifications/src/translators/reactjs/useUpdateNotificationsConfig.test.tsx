import * as React from 'react'
import {act, renderHook, waitFor} from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {mountAsyncStorage, queryClientFixture} from '@yoroi/common'
import {notificationManagerMaker} from '../../notification-manager'
import {NotificationProvider} from './NotificationProvider'
import {QueryClientProvider} from 'react-query'
import {Notifications} from '@yoroi/types'
import {useUpdateNotificationsConfig} from './useUpdateNotificationsConfig'

describe('useUpdateNotificationsConfig', () => {
  beforeEach(() => AsyncStorage.clear())

  const eventsStorage = mountAsyncStorage({path: 'events/'})
  const configStorage = mountAsyncStorage({path: 'config/'})

  it('should allow to update config', async () => {
    const client = queryClientFixture()
    const manager = notificationManagerMaker({
      eventsStorage,
      configStorage,
    })

    const wrapper = ({children}: {children: React.ReactNode}) => (
      <QueryClientProvider client={client}>
        <NotificationProvider manager={manager}>
          {children}
        </NotificationProvider>
      </QueryClientProvider>
    )
    const {result} = renderHook(() => useUpdateNotificationsConfig(), {
      wrapper,
    })

    const initialConfig = await manager.config.read()

    await act(async () => {
      result.current.mutate({
        ...(await manager.config.read()),
        [Notifications.Trigger.TransactionReceived]: {
          notify: false,
        },
      })
    })

    await waitFor(async () =>
      expect(await manager.config.read()).not.toEqual(initialConfig),
    )
  })
})
