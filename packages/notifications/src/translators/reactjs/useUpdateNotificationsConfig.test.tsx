import * as React from 'react'
import {act, renderHook, waitFor} from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {queryClientFixture} from '@yoroi/common'
import {NotificationProvider} from './NotificationProvider'
import {QueryClientProvider} from 'react-query'
import {Notifications} from '@yoroi/types'
import {useUpdateNotificationsConfig} from './useUpdateNotificationsConfig'
import {createManagerMock} from './mocks'

describe('useUpdateNotificationsConfig', () => {
  beforeEach(() => AsyncStorage.clear())

  it('should allow to update config', async () => {
    const client = queryClientFixture()
    const manager = createManagerMock()

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
