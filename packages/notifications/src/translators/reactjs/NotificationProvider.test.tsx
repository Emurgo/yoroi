import * as React from 'react'
import {
  NotificationProvider,
  useNotificationManager,
} from './NotificationProvider'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {render, renderHook} from '@testing-library/react-native'
import {createManagerMock} from './mocks'

describe('NotificationProvider', () => {
  beforeEach(() => AsyncStorage.clear())

  it('should render', () => {
    const manager = createManagerMock()
    expect(
      render(
        <NotificationProvider manager={manager}>
          <></>
        </NotificationProvider>,
      ),
    ).toBeDefined()
  })

  it('should render hook without crashing', () => {
    const manager = createManagerMock()

    const wrapper = ({children}: {children: React.ReactNode}) => (
      <NotificationProvider manager={manager}>{children}</NotificationProvider>
    )

    expect(renderHook(() => useNotificationManager(), {wrapper})).toBeDefined()
  })

  it('should crash hook if it is not wrapped in NotificationProvider', () => {
    expect(() => renderHook(() => useNotificationManager())).toThrow()
  })
})
