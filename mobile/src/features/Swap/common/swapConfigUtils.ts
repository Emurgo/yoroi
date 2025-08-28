import {SwapConfig} from '@yoroi/swap'
import {Portfolio} from '@yoroi/types'

import {undefinedToken} from './constants'

export const processSwapConfig = (
  swapConfig: SwapConfig,
  tokenInfos: Map<Portfolio.Token.Id, Portfolio.Token.Info>,
) => {
  const candidateTokenId = swapConfig?.initialPair?.tokenOut

  const tokenOutId = tokenInfos.has(candidateTokenId ?? undefinedToken)
    ? candidateTokenId
    : undefined

  const partners = swapConfig?.partners
  const excludedTokens = swapConfig?.excludedTokens ?? []

  return {
    swapConfig,
    tokenOutId,
    excludedTokens,
    partners,
  }
}
