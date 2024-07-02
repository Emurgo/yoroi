import {Catalyst, useCatalyst} from '@yoroi/staking'
import {App} from '@yoroi/types'
import {useQuery, UseQueryOptions} from 'react-query'

import {time} from '../../kernel/constants'
import {throwLoggedError} from '../../kernel/logger/helpers/throw-logged-error'
import {queryInfo} from '../../kernel/query-client'

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
