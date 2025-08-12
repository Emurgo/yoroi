import {useQuery} from '@tanstack/react-query'

import {useResolver} from '../provider/ResolverProvider'

export const useResolverShowNotice = () => {
  const {showNotice} = useResolver()

  const query = useQuery({
    queryKey: ['resolver', 'show-notice'],
    queryFn: async () => {
      return await showNotice.read()
    },
  })

  return {
    ...query,
    showNotice: query.data ?? false,
  }
}
