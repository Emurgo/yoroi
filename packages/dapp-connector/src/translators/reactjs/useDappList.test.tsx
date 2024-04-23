import {useDappList} from './useDappList'
import {renderHook, waitFor} from '@testing-library/react-native'
import * as React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

describe('useDappList', () => {
  it('should return list of dapps and filters', async () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    })

    const wrapper = (props: React.PropsWithChildren) => <QueryClientProvider {...props} client={client} />
    const {result} = renderHook(() => useDappList(), {wrapper})
    await waitFor(() => expect(result.current.data?.dapps).toBeDefined())
    await waitFor(() => expect(result.current.data?.filters).toBeDefined())
    client.clear()
  })
})
