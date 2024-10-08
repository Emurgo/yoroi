import * as React from 'react'
import {act, renderHook, waitFor} from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {queryClientFixture} from '@yoroi/common'
import {NotificationProvider} from './NotificationProvider'
import {QueryClientProvider} from 'react-query'
import {useReceivedNotificationEvents} from './useReceivedNotificationEvents'
import {createManagerMock} from './mocks'
import {Notifications} from '@yoroi/types'

describe('useReceivedNotificationEvents', () => {
  beforeEach(() => AsyncStorage.clear())

  it('should return notification events', async () => {
    const client = queryClientFixture()
    const manager = createManagerMock()

    const wrapper = ({children}: {children: React.ReactNode}) => (
      <QueryClientProvider client={client}>
        <NotificationProvider manager={manager}>
          {children}
        </NotificationProvider>
      </QueryClientProvider>
    )
    const {result} = renderHook(() => useReceivedNotificationEvents(), {
      wrapper,
    })
    await waitFor(async () =>
      expect(result.current.data).toEqual(await manager.events.read()),
    )
  })

  it('should rerender when there are new notifications', async () => {
    const client = queryClientFixture()
    const manager = createManagerMock()

    const wrapper = ({children}: {children: React.ReactNode}) => (
      <QueryClientProvider client={client}>
        <NotificationProvider manager={manager}>
          {children}
        </NotificationProvider>
      </QueryClientProvider>
    )
    const {result} = renderHook(() => useReceivedNotificationEvents(), {
      wrapper,
    })

    await waitFor(async () => expect(result.current.data).toHaveLength(0))

    act(() => {
      manager.events.push({
        id: 1,
        metadata: {
          txId: '123',
          isSentByUser: false,
          nextTxsCounter: 1,
          previousTxsCounter: 0,
        },
        date: new Date().toISOString(),
        trigger: Notifications.Trigger.TransactionReceived,
        isRead: false,
      })
    })

    await waitFor(async () => expect(result.current.data).toHaveLength(1), {
      timeout: 1000,
    })
  })
})
