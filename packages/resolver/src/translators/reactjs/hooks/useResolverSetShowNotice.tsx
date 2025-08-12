import {useMutation, UseMutationOptions} from '@tanstack/react-query'

import {useResolver} from '../provider/ResolverProvider'

export const useResolverSetShowNotice = (
  options?: UseMutationOptions<void, Error, boolean>,
) => {
  const {showNotice} = useResolver()

  const mutation = useMutation({
    mutationFn: async (value: boolean) => {
      await showNotice.save(value)
    },
    ...options,
  })

  return {
    ...mutation,
    setShowNotice: mutation.mutate,
  } as any
}
