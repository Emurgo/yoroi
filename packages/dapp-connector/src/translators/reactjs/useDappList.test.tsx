import {useDappList} from './useDappList'
import {renderHook, waitFor} from '@testing-library/react-native'
import * as React from 'react'
import {QueryClientProvider} from '@tanstack/react-query'
import {queryClientFixture} from '@yoroi/common'
import {DappConnectorProvider} from './DappConnectorProvider'
import {managerMock} from '../../manager.mocks'

describe('useDappList', () => {
  it('should return list of dapps and filters', async () => {
    const client = queryClientFixture()

    const wrapper = ({children}: React.PropsWithChildren) => (
      <QueryClientProvider client={client}>
        <DappConnectorProvider manager={managerMock}>{children}</DappConnectorProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useDappList(), {wrapper})
    await waitFor(() => expect(result.current.data?.dapps).toBeDefined())
    await waitFor(() => expect(result.current.data?.filters).toBeDefined())
    client.clear()
  })
})
