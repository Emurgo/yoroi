import {useMutationWithInvalidations} from './useMutationWithInvalidations'
import {QueryClient, QueryClientProvider, QueryKey} from '@tanstack/react-query'
import React, {PropsWithChildren} from 'react'
import {waitFor} from '@testing-library/react-native'
import {renderHook} from '@testing-library/react-hooks'

const mutationFn = () => Promise.resolve(true)

jest.useFakeTimers()

const getMockedQueryClient = () => {
  const queryClient = new QueryClient()
  queryClient.cancelQueries = jest.fn()
  queryClient.invalidateQueries = jest.fn()
  queryClient.setDefaultOptions({queries: {cacheTime: 0, retry: false}})
  return queryClient
}

describe('useMutationWithInvalidations', () => {
  const client = getMockedQueryClient()

  afterEach(() => {
    client.clear()
    jest.clearAllTimers()
  })

  it('should cancel and invalidate queries', async () => {
    const queries: Array<QueryKey> = [['query1'], ['query2']]
    const wrapper = (props: PropsWithChildren) => (
      <QueryClientProvider {...props} client={client} />
    )
    const {result} = renderHook(
      () =>
        useMutationWithInvalidations({mutationFn, invalidateQueries: queries}),
      {wrapper},
    )

    result.current.mutate(undefined)

    await waitFor(() => result.current.isSuccess)

    expect(client.cancelQueries).toHaveBeenCalledTimes(2)
    expect(client.cancelQueries).toHaveBeenNthCalledWith(1, queries[0])
    expect(client.cancelQueries).toHaveBeenNthCalledWith(2, queries[1])

    expect(client.invalidateQueries).toHaveBeenCalledTimes(2)
    expect(client.invalidateQueries).toHaveBeenNthCalledWith(1, queries[0])
    expect(client.invalidateQueries).toHaveBeenNthCalledWith(2, queries[1])
  })
})
