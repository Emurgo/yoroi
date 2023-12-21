import {useMutationWithInvalidations, useStorage} from '@yoroi/common'
import {UseMutationOptions} from 'react-query'

const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000

export const useResetShowBuyBannerSmall = (options: UseMutationOptions<void, Error, void> = {}) => {
  const storage = useStorage()

  const mutation = useMutationWithInvalidations<void, Error, void>({
    mutationFn: async () => {
      const nextDateInMs = new Date().getTime() + thirtyDaysInMs
      return storage.join('rampOnOff/').setItem('showBuyBannerSmall', nextDateInMs)
    },
    invalidateQueries: ['showBuyBannerSmall'],
    ...options,
  })

  return {
    resetShowBuyBannerSmall: mutation.mutate,
    ...mutation,
  }
}
