import {YoroiWallet} from '@yoroi/cardano-wallet/types'
import {isShelley} from '@yoroi/cardano-wallet/utils'
import {time} from '@yoroi/common'
import {Catalyst, useCatalyst} from '@yoroi/staking'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'

import {UseQueryOptions, useQuery} from '@tanstack/react-query'

import {usePortfolioPrimaryBalance} from '~/features/Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {throwLoggedError} from '~/kernel/logger/helpers/throw-logged-error'

export const useCanVote = (wallet: YoroiWallet) => {
  const {meta} = useSelectedWallet()
  const amount = usePortfolioPrimaryBalance({wallet})
  const {query, fund} = useCatalystCurrentFund()

  // Default to false if fund data is not available yet
  const sufficientFunds = fund
    ? amount.quantity >= fund.info.votingPowerThreshold
    : false

  return {
    canVote:
      !query.isLoading && !meta.isReadOnly && isShelley(meta.implementation),
    sufficientFunds,
    isLoading: query.isLoading,
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
    staleTime: time.oneDay,
    retryDelay: time.oneSecond,
    queryKey: ['useCatalystFundStatus'],
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

  return {
    query,
    fund: query.data,
  }
}
