import {UseMutationOptions} from '@tanstack/react-query'

import {useMutationWithInvalidations} from '@yoroi/common'

import {useResolver} from '../provider/ResolverProvider'

export const useResolverSetShowNotice = (
  options?: UseMutationOptions<void, Error, boolean>,
) => {
  const {showNotice} = useResolver()

  const mutation = useMutationWithInvalidations({
    mutationFn: async (value: boolean) => {
      await showNotice.save(value)
    },
    invalidateQueries: [['resolver', 'show-notice']],
    ...options,
  })

  return {
    ...mutation,
    setShowNotice: mutation.mutate,
  } as any
}
