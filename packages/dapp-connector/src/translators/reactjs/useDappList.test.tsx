import {useDappList} from './useDappList'
import {renderHook, waitFor} from '@testing-library/react-native'
import * as React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

describe('useDappList', () => {
  it('should return dapp list', async () => {
    const client = new QueryClient()
    const wrapper = (props: React.PropsWithChildren) => <QueryClientProvider {...props} client={client} />
    const {result} = renderHook(() => useDappList(), {wrapper})
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })
  })
})
