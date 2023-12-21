import {isNumber, parseNumber, useStorage} from '@yoroi/common'
import {useQuery, UseQueryOptions} from 'react-query'


export const useShowBuyBannerSmall = (options?: UseQueryOptions<boolean, Error, ['showBuyBannerSmall']>) => {
  const storage = useStorage()

  const query = useQuery({
    queryKey: ['showBuyBannerSmall'],
    suspense: true,
    ...options,
    queryFn: async () => {
      const nextDateInMs = await storage.join('rampOnOff/').getItem('showBuyBannerSmall')
      const parsedNextDateInMs = parseNumber(nextDateInMs)

      if (!isNumber(parsedNextDateInMs)) return true

      return new Date().getTime() >= parsedNextDateInMs 
    },
  })

  return query.data
}
