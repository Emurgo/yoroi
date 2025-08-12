import {useMutation} from '@tanstack/react-query'

import {useResolver} from '../provider/ResolverProvider'

export const useResolverSetShowNotice = () => {
  const {showNotice} = useResolver()

  const mutation = useMutation({
    mutationFn: async (value: boolean) => {
      await showNotice.save(value)
    },
  })

  return {
    ...mutation,
    setShowNotice: mutation.mutate,
  } as any
}
