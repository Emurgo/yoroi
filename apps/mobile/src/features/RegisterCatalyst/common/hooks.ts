import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import {time} from '@yoroi/common'
import {Catalyst, useCatalyst} from '@yoroi/staking'
import {App} from '@yoroi/types'

import {throwLoggedError} from '../../../kernel/logger/helpers/throw-logged-error'
import {queryInfo} from '../../../kernel/query-client'
import {YoroiWallet} from '../../../wallets/cardano/types'
import {isShelley} from '../../../wallets/cardano/utils'
import {usePortfolioPrimaryBalance} from '../../Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'

export const useCanVote = (wallet: YoroiWallet) => {
  const {meta} = useSelectedWallet()
  const amount = usePortfolioPrimaryBalance({wallet})
  const {fund} = useCatalystCurrentFund()
  const sufficientFunds = amount.quantity >= fund.info.votingPowerThreshold

  return {
    canVote: !meta.isReadOnly && isShelley(meta.implementation),
    sufficientFunds,
  }
}

export function useCatalystCurrentFund(
  options?: UseQueryOptions<
    {status: Catalyst.FundStatus; info: Catalyst.FundInfo},
    Error
  >,
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

      if (response.tag === 'left')
        throwLoggedError(new Error(response.error.message))
      const info = response.value.data

      return {
        info,
        status: catalyst.fundStatus(info),
      }
    },
  })

  if (query.data == null)
    throw new App.Errors.InvalidState('useCatalystFundStatus: no data')

  return {
    query,
    fund: query.data,
  }
}
