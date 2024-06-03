import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query'

export const useMutationWithInvalidations = <
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>({
  invalidateQueries,
  ...options
}: UseMutationOptions<TData, TError, TVariables, TContext> & {
  invalidateQueries?: Array<QueryKey>
}) => {
  const queryClient = useQueryClient()

  return useMutation<TData, TError, TVariables, TContext>({
    ...options,
    onMutate: (variables) => {
      invalidateQueries?.forEach((queryKey) =>
        queryClient.cancelQueries({queryKey}),
      )
      return options?.onMutate?.(variables)
    },
    onSuccess: (data, variables, context) => {
      invalidateQueries?.forEach((queryKey) =>
        queryClient.invalidateQueries({queryKey}),
      )
      return options?.onSuccess?.(data, variables, context)
    },
  })
}
