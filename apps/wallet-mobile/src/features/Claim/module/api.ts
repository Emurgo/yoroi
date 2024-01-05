import {FetchData, fetchData, isLeft} from '@yoroi/common'
import {Api, Balance} from '@yoroi/types'

import {ScanActionClaim} from '../../Scan/common/types'
import {asClaimApiError, asClaimToken} from './transformers'
import {ClaimApi, ClaimApiClaimTokensResponse} from './types'
import {ClaimTokensApiResponseSchema} from './validators'

type ClaimApiMaker = Readonly<{
  address: string
  primaryTokenId: Balance.TokenInfo['id']
}>

export const claimApiMaker = (
  {address, primaryTokenId}: ClaimApiMaker,
  deps: Readonly<{request: FetchData}> = {request: fetchData} as const,
): Readonly<ClaimApi> => {
  const claimTokens = postClaimTokens({address, primaryTokenId}, deps)

  return {
    claimTokens,
    address,
    primaryTokenId,
  } as const
}

const postClaimTokens =
  ({address, primaryTokenId}: ClaimApiMaker, {request} = {request: fetchData}) =>
  async (claimAction: ScanActionClaim) => {
    // builds the request from the action, overides address and code
    const {code, params, url} = claimAction
    const payload = {...params, address, code}

    const response = await request<ClaimApiClaimTokensResponse>({
      url,
      method: 'post',
      data: payload,
    })

    if (isLeft(response)) {
      return asClaimApiError(response.error)
    } else {
      const claimToken = response.value.data
      if (!ClaimTokensApiResponseSchema.safeParse(claimToken).success) throw new Api.Errors.ResponseMalformed()

      return asClaimToken(claimToken, primaryTokenId)
    }
  }
