import {renderHook, waitFor} from '@testing-library/react-native'
import * as React from 'react'

import {managerMock} from '../../manager.mocks'
import {DappConnectorProvider} from './DappConnectorProvider'
import {useDappList} from './useDappList'

describe('useDappList', () => {
  it('should return list of dapps and filters', async () => {
    const wrapper = ({children}: React.PropsWithChildren) => (
      <DappConnectorProvider manager={managerMock}>
        {children}
      </DappConnectorProvider>
    )

    const {result} = renderHook(() => useDappList(), {wrapper})
    await waitFor(() => expect(result.current.data?.dapps).toBeDefined())
    await waitFor(() => expect(result.current.data?.filters).toBeDefined())
  })
})
