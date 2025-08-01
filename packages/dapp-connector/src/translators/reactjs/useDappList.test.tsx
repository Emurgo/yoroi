import {renderHook, waitFor} from '@testing-library/react-native'

import {useDappList} from './useDappList'
import * as React from 'react'
import {DappConnectorProvider} from './DappConnectorProvider'
import {managerMock} from '../../manager.mocks'

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
