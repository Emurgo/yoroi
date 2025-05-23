import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import * as React from 'react'
import {act, renderHook, waitFor} from '@testing-library/react-native'

import {useMutationWithInvalidations} from './useMutationWithInvalidations'

const mutationFn = () => Promise.resolve(true)

describe('useMutationWithInvalidations', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = getMockedQueryClient()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('should cancel and invalidate queries', async () => {
    const queries = [['query1'], ['query2']]
    const wrapper = (props: React.PropsWithChildren) => (
      <QueryClientProvider {...props} client={queryClient} />
    )
    const {result} = renderHook(
      () =>
        useMutationWithInvalidations({mutationFn, invalidateQueries: queries}),
      {wrapper},
    )

    await act(async () => {
      result.current.mutate(undefined)
    })

    await act(async () => {
      await waitFor(() => result.current.isSuccess)
    })

    expect(queryClient.cancelQueries).toHaveBeenCalledTimes(2)
    expect(queryClient.cancelQueries).toHaveBeenNthCalledWith(1, {
      queryKey: queries[0],
    })
    expect(queryClient.cancelQueries).toHaveBeenNthCalledWith(2, {
      queryKey: queries[1],
    })

    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(2)
    expect(queryClient.invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: queries[0],
    })
    expect(queryClient.invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: queries[1],
    })
  })
})

const getMockedQueryClient = () => {
  const queryClient = new QueryClient()
  queryClient.cancelQueries = jest.fn()
  queryClient.invalidateQueries = jest.fn()
  queryClient.setDefaultOptions({queries: {retry: false, gcTime: 0}})
  return queryClient
}
