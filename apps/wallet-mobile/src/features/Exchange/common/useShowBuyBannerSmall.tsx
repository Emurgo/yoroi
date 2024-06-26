import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import {isNumber, parseNumber, useAsyncStorage} from '@yoroi/common'

import {useBalances} from '../../../yoroi-wallets/hooks'
import {Amounts, asQuantity, Quantities} from '../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {storageKeyShowBuyBannerSmall, storageRootExchange} from './constants'

export const useShowBuyBannerSmall = (options?: UseQueryOptions<boolean, Error, boolean, [string, string]>) => {
  const {wallet} = useSelectedWallet()

  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(balances, wallet.primaryTokenInfo.id)
  const isInThresholdToBuy = Quantities.isGreaterThan(minAdaThreshold, primaryAmount.quantity)

  const storage = useAsyncStorage()
  const rampOnOffStorage = storage.join(`wallet/${wallet.id}/${storageRootExchange}/`)

  const query = useQuery({
    suspense: true,
    ...options,
    queryKey: [wallet.id, storageKeyShowBuyBannerSmall],
    queryFn: async () => {
      if (!isInThresholdToBuy) return false

      const nextDateInMs = await rampOnOffStorage.getItem(storageKeyShowBuyBannerSmall)
      const parsedNextDateInMs = parseNumber(nextDateInMs)

      if (!isNumber(parsedNextDateInMs)) return true

      return new Date().getTime() >= parsedNextDateInMs
    },
  })

  return query.data
}

const minAdaThreshold = asQuantity(5_000_000)
