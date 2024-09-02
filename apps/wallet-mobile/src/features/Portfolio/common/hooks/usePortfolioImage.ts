import {Portfolio} from '@yoroi/types'
import {Image} from 'expo-image'
import {useMutation} from 'react-query'

import {useSelectedNetwork} from '../../../WalletManager/common/hooks/useSelectedNetwork'

export const usePortfolioImageInvalidate = () => {
  const {
    networkManager: {tokenManager},
  } = useSelectedNetwork()
  const mutation = useMutation({
    mutationFn: async (ids: Array<Portfolio.Token.Id>) => {
      await tokenManager.api.tokenImageInvalidate(ids)
      await Image.clearDiskCache()
      await Image.clearMemoryCache()
    },
  })

  return {
    ...mutation,
    invalidate: mutation.mutate,
  }
}
