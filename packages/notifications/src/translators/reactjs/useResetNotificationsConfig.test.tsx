import * as React from 'react'
import {act, renderHook, waitFor} from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {queryClientFixture} from '@yoroi/common'
import {NotificationProvider} from './NotificationProvider'
import {QueryClientProvider} from 'react-query'
import {useResetNotificationsConfig} from './useResetNotificationsConfig'
import {Notifications} from '@yoroi/types'
import {createManagerMock} from './mocks'

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
