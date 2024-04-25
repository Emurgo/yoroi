import {useDappList} from './useDappList'
import {renderHook, waitFor} from '@testing-library/react-native'
import * as React from 'react'
import {QueryClientProvider} from 'react-query'
import {queryClientFixture} from '@yoroi/common'

describe('useDappList', () => {
  it('should return list of dapps and filters', async () => {
    const client = queryClientFixture()

    const wrapper = (props: React.PropsWithChildren) => <QueryClientProvider {...props} client={client} />
    const {result} = renderHook(() => useDappList(), {wrapper})
    await waitFor(() => expect(result.current.data?.dapps).toBeDefined())
    await waitFor(() => expect(result.current.data?.filters).toBeDefined())
    client.clear()
  })
})
