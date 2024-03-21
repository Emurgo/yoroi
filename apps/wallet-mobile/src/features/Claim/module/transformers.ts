import {getApiError} from '@yoroi/common'
import {Api, Balance} from '@yoroi/types'

import {Amounts, asQuantity} from '../../../yoroi-wallets/utils/utils'
import {claimApiErrors} from './errors'
import {ClaimApiClaimTokensResponse, ClaimToken} from './types'

// if the error is a known claim api error, throw it with a more specific error message otherwise throw the api error
export const asClaimApiError = (error: Api.ResponseError) => {
  const ClaimApiError = claimApiErrors.find(({statusCode}) => statusCode === error.status)
  if (ClaimApiError) throw new ClaimApiError()
  throw getApiError(error)
}

export const asClaimToken = (
  claimItemResponse: ClaimApiClaimTokensResponse,
  primaryTokenId: Balance.TokenInfo['id'],
) => {
  const {lovelaces, tokens, status} = claimItemResponse
  const ptQuantity = asQuantity(lovelaces)
  const amounts = Amounts.fromArray(
    Object.entries(tokens)
      .concat([[primaryTokenId, ptQuantity]])
      .map(([tokenId, quantity]): Balance.Amount => ({tokenId, quantity: asQuantity(quantity)})),
  )

  if (status === 'claimed') {
    const claimed: Readonly<ClaimToken> = {
      status: 'done',
      amounts,
      txHash: claimItemResponse.tx_hash,
    }
    return claimed
  } else if (status === 'queued') {
    const queued: Readonly<ClaimToken> = {
      status: 'processing',
      amounts,
    }
    return queued
  } else {
    const accepted: Readonly<ClaimToken> = {
      status: 'accepted',
      amounts,
    }
    return accepted
  }
}
