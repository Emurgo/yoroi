import {useQuery} from '@tanstack/react-query'
import {getSwapConfigApiMaker} from '@yoroi/swap'

import {undefinedToken} from './constants'
import {useSwap} from './useSwap'

export const useSwapConfig = () => {
  const getSwapConfig = getSwapConfigApiMaker()
  const query = useQuery({
    useErrorBoundary: false,
    queryKey: ['useSwapConfig'],
    queryFn: () => getSwapConfig(),
  })

  const swapConfig = query.data

  const candidateTokenId = swapConfig?.initialPair?.tokenOut

  const {tokenInfos} = useSwap()

  const tokenOutId = tokenInfos.has(candidateTokenId ?? undefinedToken)
    ? candidateTokenId
    : undefined

  const partners = swapConfig?.partners

  const excludedTokens = swapConfig?.excludedTokens ?? []

  return {
    ...query,
    swapConfig,
    tokenOutId,
    excludedTokens,
    partners,
  }
}
