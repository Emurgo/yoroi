import {Catalyst, useCatalyst} from '@yoroi/staking'
import {App} from '@yoroi/types'
import {useQuery, UseQueryOptions} from 'react-query'

import {time} from '../../kernel/constants'
import {throwLoggedError} from '../../kernel/logger/helpers/throw-logged-error'
import {queryInfo} from '../../kernel/query-client'

export function useCatalystFundStatus(options?: UseQueryOptions<Catalyst.FundStatus, Error>) {
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

      return catalyst.fundStatus(response.value.data)
    },
  })

  if (query.data == null) throw new App.Errors.InvalidState('useCatalystFundStatus: no data')

  return {
    query,
    fundStatus: query.data,
  }
}
