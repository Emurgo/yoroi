import {useMutationWithInvalidations} from './hooks'
import {QueryClient, QueryClientProvider} from 'react-query'
import React, {PropsWithChildren} from 'react'
import {act, renderHook, waitFor} from '@testing-library/react-native'

const mutationFn = () => Promise.resolve(true)

describe('useMutationWithInvalidations', () => {
  it('should cancel and invalidate queries', async () => {
    const queries = ['query1', 'query2']
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
      await result.current.mutate(undefined)
    })

    await waitFor(() => result.current.isSuccess)

    expect((client.cancelQueries as any).mock.calls[0][0]).toBe(queries[0])
    expect((client.cancelQueries as any).mock.calls[1][0]).toBe(queries[1])

    expect((client.invalidateQueries as any).mock.calls[0][0]).toBe(queries[0])
    expect((client.invalidateQueries as any).mock.calls[1][0]).toBe(queries[1])
  })
})

const getMockedQueryClient = () => {
  const queryClient = new QueryClient()
  queryClient.cancelQueries = jest.fn()
  queryClient.invalidateQueries = jest.fn()
  return queryClient
}
