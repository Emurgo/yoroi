import {useSuspenseQuery} from '@tanstack/react-query'
import {
  isBoolean,
  parseSafe,
  useAsyncStorage,
  useMutationWithInvalidations,
} from '@yoroi/common'

import {Disclaimer} from '../../common/types'

export const useDisclaimerState = (name: Disclaimer, key = 'accepted') => {
  const storage = useAsyncStorage()
  const walletStorage = storage.join(`disclaimer/${name}/`)
  const queryKey = ['disclaimer', name]

  const mutation = useMutationWithInvalidations({
    mutationFn: (value: boolean) => walletStorage.setItem(key, value),
    invalidateQueries: [queryKey],
  })

  const query = useSuspenseQuery({
    queryKey,
    queryFn: async () => {
      const storedStorage = await walletStorage.getItem(key)
      const parsed = parseSafe(storedStorage)
      return isBoolean(parsed) ? parsed : false
    },
  })

  return [query.data, mutation.mutate] as const
}
