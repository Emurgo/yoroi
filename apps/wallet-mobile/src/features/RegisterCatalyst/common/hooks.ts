import {Catalyst, useCatalyst} from '@yoroi/staking'
import {App} from '@yoroi/types'
import {useQuery, UseQueryOptions} from 'react-query'

import {time} from '../../../kernel/constants'
import {throwLoggedError} from '../../../kernel/logger/helpers/throw-logged-error'
import {queryInfo} from '../../../kernel/query-client'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {isShelley} from '../../../yoroi-wallets/cardano/utils'
import {usePortfolioPrimaryBalance} from '../../Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {catalystConfig} from '../../WalletManager/common/adapters/cardano/catalyst-config'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'

export const useCanVote = (wallet: YoroiWallet) => {
  const {meta} = useSelectedWallet()
  const amount = usePortfolioPrimaryBalance({wallet})
  const sufficientFunds = amount.quantity >= catalystConfig.minAda

  return {
    canVote: !meta.isReadOnly && isShelley(meta.implementation),
    sufficientFunds,
  }
}

export function useCatalystCurrentFund(
  options?: UseQueryOptions<{status: Catalyst.FundStatus; info: Catalyst.FundInfo}, Error>,
) {
  const catalyst = useCatalyst()
  const query = useQuery({
    suspense: true,
    useErrorBoundary: true,
    staleTime: time.oneDay,
    cacheTime: time.oneDay,
    retryDelay: time.oneSecond,
    queryKey: [queryInfo.keyToPersist, 'useCatalystFundStatus'],
    ...options,

    queryFn: async () => {
      const response = await catalyst.getFundInfo()

      if (response.tag === 'left') throwLoggedError(new Error(response.error.message))
      const info = response.value.data

      return {
        info,
        status: catalyst.fundStatus(info),
      }
    },
  })

  if (query.data == null) throw new App.Errors.InvalidState('useCatalystFundStatus: no data')

  return {
    query,
    fund: query.data,
  }
}
