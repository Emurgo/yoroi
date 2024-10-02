import * as React from 'react'
import {
  NotificationProvider,
  useNotificationManager,
} from './NotificationProvider'
import {notificationManagerMaker} from '../../notification-manager'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {mountAsyncStorage} from '@yoroi/common'
import {render, renderHook} from '@testing-library/react-native'

describe('NotificationProvider', () => {
  beforeEach(() => AsyncStorage.clear())

  const eventsStorage = mountAsyncStorage({path: 'events/'})
  const configStorage = mountAsyncStorage({path: 'config/'})

  it('should render', () => {
    const manager = notificationManagerMaker({
      eventsStorage,
      configStorage,
    })

    expect(
      render(
        <NotificationProvider manager={manager}>
          <></>
        </NotificationProvider>,
      ),
    ).toBeDefined()
  })

  it('should render hook without crashing', () => {
    const manager = notificationManagerMaker({
      eventsStorage,
      configStorage,
    })

    const wrapper = ({children}: {children: React.ReactNode}) => (
      <NotificationProvider manager={manager}>{children}</NotificationProvider>
    )

    expect(renderHook(() => useNotificationManager(), {wrapper})).toBeDefined()
  })

  it('should crash hook if it is not wrapped in NotificationProvider', () => {
    expect(() => renderHook(() => useNotificationManager())).toThrow()
  })
})
