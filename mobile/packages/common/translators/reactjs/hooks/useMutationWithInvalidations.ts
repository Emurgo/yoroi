import {
  QueryKey,
  UseMutationOptions,
  useMutation,
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
    onMutate: (variables, context) => {
      invalidateQueries?.forEach((key) =>
        queryClient.cancelQueries({queryKey: key}),
      )
      return options?.onMutate?.(variables, context) as
        | TContext
        | Promise<TContext>
    },
    onSuccess: (data, variables, context, mutation) => {
      invalidateQueries?.forEach((key) =>
        queryClient.invalidateQueries({queryKey: key}),
      )
      return options?.onSuccess?.(data, variables, context, mutation)
    },
  })
}
