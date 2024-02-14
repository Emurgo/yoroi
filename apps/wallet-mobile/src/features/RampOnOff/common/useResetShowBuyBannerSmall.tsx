import {useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {UseMutationOptions} from 'react-query'

import {useSelectedWallet} from '../../../SelectedWallet/Context/SelectedWalletContext'
import {storageKeyShowBuyBannerSmall, storageRootRampOnOff} from './constants'

const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000

export const useResetShowBuyBannerSmall = (options: UseMutationOptions<void, Error, void> = {}) => {
  const wallet = useSelectedWallet()
  const storage = useAsyncStorage()
  const rampOnOffStorage = storage.join(`wallet/${wallet.id}/${storageRootRampOnOff}/`)

  const mutation = useMutationWithInvalidations<void, Error, void>({
    mutationFn: () => {
      const nextDateInMs = new Date().getTime() + thirtyDaysInMs
      return rampOnOffStorage.setItem(storageKeyShowBuyBannerSmall, nextDateInMs)
    },
    invalidateQueries: [[wallet.id, storageKeyShowBuyBannerSmall]],
    ...options,
  })

  return {
    resetShowBuyBannerSmall: mutation.mutate,
    ...mutation,
  }
}
