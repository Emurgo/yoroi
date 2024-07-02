import {isRight} from '@yoroi/common'
import {Chain, Portfolio} from '@yoroi/types'
import {UseQueryOptions, useQuery} from 'react-query'
import {createUnknownTokenInfo} from '../../helpers/create-unknown-token-info'

export function usePorfolioTokenInfo(
  {
    id,
    getTokenInfo,
    network,
  }: {
    id: Portfolio.Token.Id
    getTokenInfo: Portfolio.Api.Api['tokenInfo']
    network: Chain.SupportedNetworks
  },
  options?: UseQueryOptions<
    Portfolio.Token.Info,
    Error,
    Portfolio.Token.Info,
    [Chain.SupportedNetworks, 'usePorfolioTokenInfo', Portfolio.Token.Id]
  >,
) {
  const query = useQuery({
    queryKey: [network, 'usePorfolioTokenInfo', id],
    ...options,
    queryFn: async () => {
      const response = await getTokenInfo(id)
      if (isRight(response)) return response.value.data
      const [, assetName] = id.split('.')
      return createUnknownTokenInfo({id, name: assetName!})
    },
  })

  return {
    ...query,
    tokenTraits: query.data,
  }
}
