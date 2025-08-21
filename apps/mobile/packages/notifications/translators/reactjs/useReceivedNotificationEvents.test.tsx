import {Notifications} from '@yoroi/types'

import AsyncStorage from '@react-native-async-storage/async-storage'
import {QueryClientProvider} from '@tanstack/react-query'
import {act, renderHook, waitFor} from '@testing-library/react-native'
import * as React from 'react'

import {queryClientFixture} from '../../fixtures/query-client'
import {NotificationProvider} from './NotificationProvider'
import {createManagerMock} from './mocks'
import {useReceivedNotificationEvents} from './useReceivedNotificationEvents'

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
          walletId: 'walletId',
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
