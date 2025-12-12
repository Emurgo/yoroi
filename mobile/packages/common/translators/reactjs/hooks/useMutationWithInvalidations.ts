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
  onMutate: userOnMutate,
  onSuccess: userOnSuccess,
  ...options
}: UseMutationOptions<TData, TError, TVariables, TContext> & {
  invalidateQueries?: Array<QueryKey>
}) => {
  const queryClient = useQueryClient()

  return useMutation<TData, TError, TVariables, TContext>({
    ...options,
    onMutate: async (variables: TVariables) => {
      invalidateQueries?.forEach((key) =>
        queryClient.cancelQueries({queryKey: key}),
      )
      // In react-query v5, onMutate only receives variables parameter
      const userContext = await (
        userOnMutate as
          | ((variables: TVariables) => Promise<TContext> | TContext)
          | undefined
      )?.(variables)
      return (userContext ?? undefined) as TContext
    },
    onSuccess: (data: TData, variables: TVariables, context: TContext) => {
      invalidateQueries?.forEach((key) =>
        queryClient.invalidateQueries({queryKey: key}),
      )
      // In react-query v5, onSuccess receives (data, variables, context) - 3 parameters
      ;(
        userOnSuccess as
          | ((data: TData, variables: TVariables, context: TContext) => void)
          | undefined
      )?.(data, variables, context)
    },
  })
}
