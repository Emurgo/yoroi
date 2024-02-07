import {UseMutationOptions} from 'react-query'

import {useResolver} from '../provider/ResolverProvider'
import {useMutationWithInvalidations} from '../../../utils/useMutationWithInvalidations'

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
