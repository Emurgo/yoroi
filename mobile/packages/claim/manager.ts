import {FetchData, fetchData, isLeft} from '@yoroi/common'
import {Address, Api, Branded, Claim, Links, Portfolio} from '@yoroi/types'

import {freeze} from 'immer'

import {asClaimApiError, asClaimToken} from './transformers'
import {ClaimTokensApiResponseSchema} from './validators'

type ClaimManagerMakerOptions = Readonly<{
  address: Address | string
  primaryTokenInfo: Portfolio.Token.Info
  tokenManager: Portfolio.Manager.Token
}>

export const claimManagerMaker = (
  {address, primaryTokenInfo, tokenManager}: ClaimManagerMakerOptions,
  deps: Readonly<{request: FetchData}> = {request: fetchData} as const,
): Readonly<Claim.Manager> => {
  const claimTokens = postClaimTokens(
    {address, primaryTokenInfo, tokenManager},
    deps,
  )

  const addressBranded =
    typeof address === 'string' ? Branded.asAddress(address) : address
  return freeze({
    claimTokens,
    address: addressBranded,
    primaryTokenInfo,
  })
}

const postClaimTokens =
  (
    {address, primaryTokenInfo, tokenManager}: ClaimManagerMakerOptions,
    {request}: {request: FetchData},
  ) =>
  async (claimAction: Links.CardanoActionClaim) => {
    // builds the request from the action, overides address and code
    const {code, params, url} = claimAction
    const payload = {...params, address, code}

    const response = await request<Claim.Api.ClaimTokensResponse>({
      url,
      method: 'post',
      data: payload,
    })

    if (isLeft(response)) {
      return asClaimApiError(response.error)
    } else {
      const claimInfo = response.value.data
      if (!ClaimTokensApiResponseSchema.safeParse(claimInfo).success)
        throw new Api.Errors.ResponseMalformed()

      return asClaimToken(claimInfo, primaryTokenInfo, tokenManager)
    }
  }
