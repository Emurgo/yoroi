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
    onMutate: async (variables: TVariables, context: any) => {
      invalidateQueries?.forEach((key) =>
        queryClient.cancelQueries({queryKey: key}),
      )
      const userContext = await options?.onMutate?.(variables, context)
      return (userContext ?? undefined) as TContext
    },
    onSuccess: (
      data: TData,
      variables: TVariables,
      context: TContext,
      mutation: any,
    ) => {
      invalidateQueries?.forEach((key) =>
        queryClient.invalidateQueries({queryKey: key}),
      )
      options?.onSuccess?.(data, variables, context, mutation)
    },
  })
}
