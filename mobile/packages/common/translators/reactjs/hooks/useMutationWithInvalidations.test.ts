import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {act, renderHook, waitFor} from '@testing-library/react'
import * as React from 'react'

import {useMutationWithInvalidations} from './useMutationWithInvalidations'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {retry: false},
      mutations: {retry: false},
    },
  })

  return ({children}: {children: React.ReactNode}) =>
    React.createElement(QueryClientProvider, {client: queryClient}, children)
}

describe('useMutationWithInvalidations', () => {
  it('should invalidate queries on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {retry: false},
        mutations: {retry: false},
      },
    })

    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')
    const cancelSpy = jest.spyOn(queryClient, 'cancelQueries')

    const wrapper = ({children}: {children: React.ReactNode}) =>
      React.createElement(QueryClientProvider, {client: queryClient}, children)

    const {result} = renderHook(
      () =>
        useMutationWithInvalidations<void, unknown, void, unknown>({
          mutationFn: async () => {},
          invalidateQueries: [['test']],
        }),
      {wrapper},
    )

    act(() => {
      result.current.mutate(undefined)
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(cancelSpy).toHaveBeenCalledWith({queryKey: ['test']})
    expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['test']})
  })

  it('should call onMutate if provided', async () => {
    const onMutate = jest.fn()

    const {result} = renderHook(
      () =>
        useMutationWithInvalidations<string, unknown, string, unknown>({
          mutationFn: async (_variables: string) => 'success',
          onMutate,
        }),
      {wrapper: createWrapper()},
    )

    act(() => {
      result.current.mutate('test')
    })

    await waitFor(() => {
      expect(onMutate).toHaveBeenCalled()
      expect(onMutate).toHaveBeenCalledWith('test', expect.anything())
    })
  })

  it('should call onSuccess if provided', async () => {
    const onSuccess = jest.fn()

    const {result} = renderHook(
      () =>
        useMutationWithInvalidations<string, unknown, void, unknown>({
          mutationFn: async () => 'success',
          onSuccess,
        }),
      {wrapper: createWrapper()},
    )

    act(() => {
      result.current.mutate(undefined)
    })

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledWith(
        'success',
        undefined,
        undefined,
        expect.anything(),
      )
    })
  })

  it('should work without invalidateQueries', async () => {
    const {result} = renderHook(
      () =>
        useMutationWithInvalidations<string, unknown, void, unknown>({
          mutationFn: async () => 'success',
        }),
      {wrapper: createWrapper()},
    )

    act(() => {
      result.current.mutate(undefined)
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })
})
