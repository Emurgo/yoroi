import {useMutationWithInvalidations} from './useMutationWithInvalidations'
import {QueryClient, QueryClientProvider} from 'react-query'
import React, {PropsWithChildren} from 'react'
import {act, renderHook, waitFor} from '@testing-library/react-native'

const mutationFn = () => Promise.resolve(true)

describe('useMutationWithInvalidations', () => {
  it('should cancel and invalidate queries', async () => {
    const queries = [['query1'], ['query2']]
    const client = getMockedQueryClient()
    const wrapper = (props: PropsWithChildren) => (
      <QueryClientProvider {...props} client={client} />
    )
    const {result} = renderHook(
      () =>
        useMutationWithInvalidations({mutationFn, invalidateQueries: queries}),
      {wrapper},
    )

    await act(async () => {
      result.current.mutate(undefined)
    })

    await waitFor(() => result.current.isSuccess)

    expect(client.cancelQueries).toHaveBeenCalledTimes(2)
    expect(client.cancelQueries).toHaveBeenNthCalledWith(1, {
      queryKey: queries[0],
    })
    expect(client.cancelQueries).toHaveBeenNthCalledWith(2, {
      queryKey: queries[1],
    })

    expect(client.invalidateQueries).toHaveBeenCalledTimes(2)
    expect(client.invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: queries[0],
    })
    expect(client.invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: queries[1],
    })
  })
})

const getMockedQueryClient = () => {
  const queryClient = new QueryClient()
  queryClient.cancelQueries = jest.fn()
  queryClient.invalidateQueries = jest.fn()
  queryClient.setDefaultOptions({queries: {cacheTime: 0, retry: false}})
  return queryClient
}
