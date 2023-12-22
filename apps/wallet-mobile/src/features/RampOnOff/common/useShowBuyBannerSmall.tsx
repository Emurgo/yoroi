import {isNumber, parseNumber, useStorage} from '@yoroi/common'
import {useQuery, UseQueryOptions} from 'react-query'

import {useSelectedWallet} from '../../../SelectedWallet/Context/SelectedWalletContext'
import {storageKeyShowBuyBannerSmall, storageRootRampOnOff} from './constants'

export const useShowBuyBannerSmall = (options?: UseQueryOptions<boolean, Error, boolean, [string, string]>) => {
  const wallet = useSelectedWallet()
  const storage = useStorage()
  const rampOnOffStorage = storage.join(`wallet/${wallet.id}/${storageRootRampOnOff}/`)

  const query = useQuery({
    suspense: true,
    ...options,
    queryKey: [wallet.id, storageKeyShowBuyBannerSmall],
    queryFn: async () => {
      const nextDateInMs = await rampOnOffStorage.getItem(storageKeyShowBuyBannerSmall)
      const parsedNextDateInMs = parseNumber(nextDateInMs)

      if (!isNumber(parsedNextDateInMs)) return true

      return new Date().getTime() >= parsedNextDateInMs
    },
  })

  return query.data
}
