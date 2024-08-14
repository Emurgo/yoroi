import {isRight} from '@yoroi/common'
import {Chain, Portfolio} from '@yoroi/types'
import {UseQueryOptions, useQuery} from 'react-query'
import {createUnknownTokenInfo} from '../../helpers/create-unknown-token-info'
import {isPrimaryToken} from '../../helpers/is-primary-token'

export function usePortfolioTokenInfo(
  {
    id,
    getTokenInfo,
    network,
    primaryTokenInfo,
  }: {
    id: Portfolio.Token.Id
    getTokenInfo: Portfolio.Api.Api['tokenInfo']
    network: Chain.SupportedNetworks
    primaryTokenInfo: Portfolio.Token.Info
  },
  options?: UseQueryOptions<
    Portfolio.Token.Info,
    Error,
    Portfolio.Token.Info,
    [Chain.SupportedNetworks, 'usePortfolioTokenInfo', Portfolio.Token.Id]
  >,
) {
  const query = useQuery({
    queryKey: [network, 'usePortfolioTokenInfo', id],
    ...options,
    queryFn: async () => {
      if (isPrimaryToken(id)) return primaryTokenInfo
      const response = await getTokenInfo(id)
      if (isRight(response)) return response.value.data
      const [, assetName] = id.split('.')
      return createUnknownTokenInfo({id, name: assetName!})
    },
  })

  return {
    ...query,
    tokenInfo: query.data,
  }
}
