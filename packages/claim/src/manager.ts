import {FetchData, fetchData, isLeft} from '@yoroi/common'
import {Api, Claim, Portfolio, Scan} from '@yoroi/types'

import {asClaimApiError, asClaimToken} from './transformers'
import {ClaimTokensApiResponseSchema} from './validators'

type ClaimManagerMakerOptions = Readonly<{
  address: string
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

  return {
    claimTokens,
    address,
    primaryTokenInfo,
  } as const
}

const postClaimTokens =
  (
    {address, primaryTokenInfo, tokenManager}: ClaimManagerMakerOptions,
    {request} = {request: fetchData},
  ) =>
  async (claimAction: Scan.ActionClaim) => {
    // builds the request from the action, overides address and code
    const {code, params, url} = claimAction
    const payload = {...params, address, code}

    try {
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
    } catch (error) {
      throw new Api.Errors.Unknown((error as Error)?.message)
    }
  }
