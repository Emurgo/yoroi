import {getApiError, toBigInt} from '@yoroi/common'
import {isPrimaryToken, isTokenId} from '@yoroi/portfolio'
import {Api, Portfolio} from '@yoroi/types'

import {claimApiErrors} from './errors'
import {ClaimApiClaimTokensResponse, ClaimInfo} from './types'

// if the error is a known claim api error, throw it with a more specific error message otherwise throw the api error
export const asClaimApiError = (error: Api.ResponseError) => {
  const ClaimApiError = claimApiErrors.find(({statusCode}) => statusCode === error.status)
  if (ClaimApiError) throw new ClaimApiError()
  throw getApiError(error)
}

export const asClaimToken = async (
  claimItemResponse: ClaimApiClaimTokensResponse,
  primaryTokenInfo: Portfolio.Token.Info,
  tokenManager: Portfolio.Manager.Token,
) => {
  const {lovelaces, tokens, status} = claimItemResponse
  const ptQuantity = toBigInt(lovelaces, 0, true)
  // NOTE: filter out wrong token ids and pt if wrongly included
  const ids = new Set(
    Object.keys(tokens)
      .filter(isTokenId)
      .filter((id) => !isPrimaryToken(id)),
  )
  const infos = await tokenManager.sync({secondaryTokenIds: Array.from(ids), sourceId: 'claim-module'})
  const amounts: Array<Portfolio.Token.Amount> = []
  for (const [tokenId, cachedInfo] of infos.entries()) {
    if (!cachedInfo?.record || !ids.has(tokenId)) continue
    amounts.push({
      info: cachedInfo.record,
      quantity: toBigInt(tokens[tokenId], 0, true),
    })
  }
  if (ptQuantity > 0n) {
    amounts.push({
      info: primaryTokenInfo,
      quantity: ptQuantity,
    })
  }

  if (status === 'claimed') {
    const claimed: Readonly<ClaimInfo> = {
      status: 'done',
      amounts,
      txHash: claimItemResponse.tx_hash,
    }
    return claimed
  } else if (status === 'queued') {
    const queued: Readonly<ClaimInfo> = {
      status: 'processing',
      amounts,
    }
    return queued
  } else {
    const accepted: Readonly<ClaimInfo> = {
      status: 'accepted',
      amounts,
    }
    return accepted
  }
}
