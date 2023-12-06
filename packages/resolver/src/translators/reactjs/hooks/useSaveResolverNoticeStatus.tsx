import {UseMutationOptions, useMutation, useQueryClient} from 'react-query'
import {useResolver} from '../provider/ResolverProvider'

export const useSaveResolverNoticeStatus = (
  options?: UseMutationOptions<void, Error, boolean>,
) => {
  const {saveResolverNoticeStatus} = useResolver()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    ...options,
    mutationKey: ['resolver'],
    mutationFn: saveResolverNoticeStatus,
    onSuccess: (...args) => {
      options?.onSuccess?.(...args)
      queryClient.invalidateQueries(['resolver'])
    },
  })
  return {
    ...mutation,
    saveResolverNoticeStatus: mutation.mutate,
  }
}
