import {UseMutationOptions} from '@tanstack/react-query'

import {useMutationWithInvalidations} from '@yoroi/common'

import {useResolver} from '../provider/ResolverProvider'

export const useResolverSetShowNotice = (
  options?: UseMutationOptions<void, Error, boolean>,
) => {
  const {showNotice} = useResolver()

  const mutation = useMutationWithInvalidations({
    mutationFn: showNotice.save,
    invalidateQueries: [[useResolverShowNotice']],
    ...options,
    mutationKey: [['useResolverShowNotice']],
  })

  return {
    ...mutation,
    setShowNotice: mutation.mutate,
  }
}
