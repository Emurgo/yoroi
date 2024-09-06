import {getApiError, toBigInt} from '@yoroi/common'
import {isPrimaryToken, isTokenId} from '@yoroi/portfolio'
import {Api, Claim, Portfolio} from '@yoroi/types'

import {claimApiErrors} from './errors'

// if the error is a known claim api error, throw it with a more specific error message otherwise throw the api error
export const asClaimApiError = (error: Api.ResponseError) => {
  const ClaimApiError = claimApiErrors.find(
    ({statusCode}) => statusCode === error.status,
  )
  if (ClaimApiError) throw new ClaimApiError()
  throw getApiError(error)
}

export const asClaimToken = async (
  claimItemResponse: Claim.Api.ClaimTokensResponse,
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
  const infos = await tokenManager.sync({
    secondaryTokenIds: Array.from(ids),
    sourceId: 'claim-module',
  })
  const amounts: Array<Portfolio.Token.Amount> = []

  if (ptQuantity > 0n) {
    amounts.push({
      info: primaryTokenInfo,
      quantity: ptQuantity,
    })
  }

  for (const [tokenId, cachedInfo] of infos.entries()) {
    if (!cachedInfo?.record || !ids.has(tokenId)) continue
    const quantity = tokens[tokenId]
    if (quantity)
      amounts.push({
        info: cachedInfo.record,
        quantity: toBigInt(quantity, 0, true),
      })
  }

  if (status === 'claimed') {
    const claimed: Readonly<Claim.Info> = {
      status: 'done',
      amounts,
      txHash: claimItemResponse.tx_hash,
    }
    return claimed
  } else if (status === 'queued') {
    const queued: Readonly<Claim.Info> = {
      status: 'processing',
      amounts,
    }
    return queued
  } else {
    const accepted: Readonly<Claim.Info> = {
      status: 'accepted',
      amounts,
    }
    return accepted
  }
}
