import {UseMutationOptions} from '@tanstack/react-query'

import {useResolver} from '../provider/ResolverProvider'
import {useMutationWithInvalidations} from '@yoroi/common'

export const useResolverSetShowNotice = (
  options?: UseMutationOptions<void, Error, boolean>,
) => {
  const {showNotice} = useResolver()

  const mutation = useMutationWithInvalidations({
    ...options,
    mutationKey: ['useResolverSetShowNotice'],
    mutationFn: showNotice.save,
    invalidateQueries: [['useResolverShowNotice']],
  })
  return {
    ...mutation,
    setShowNotice: mutation.mutate,
  }
}
