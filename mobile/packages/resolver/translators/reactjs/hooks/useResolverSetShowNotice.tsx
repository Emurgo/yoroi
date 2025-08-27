import {useMutationWithInvalidations} from '@yoroi/common'

import {UseMutationOptions, UseMutationResult} from '@tanstack/react-query'

import {useResolver} from '../provider/ResolverProvider'

type UseResolverSetShowNoticeResult = UseMutationResult<
  void,
  Error,
  boolean
> & {
  setShowNotice: (value: boolean) => void
}
export const useResolverSetShowNotice = (
  options?: UseMutationOptions<void, Error, boolean>,
): UseResolverSetShowNoticeResult => {
  const {showNotice} = useResolver()

  const mutation = useMutationWithInvalidations({
    mutationFn: showNotice.save,
    invalidateQueries: [['useResolverShowNotice']],
    ...options,
    mutationKey: [['useResolverShowNotice']],
  })

  return {
    ...mutation,
    setShowNotice: mutation.mutate,
  }
}
