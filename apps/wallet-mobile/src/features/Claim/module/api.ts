import {FetchData, fetchData, isLeft} from '@yoroi/common'
import {Api, Portfolio} from '@yoroi/types'

import {ScanActionClaim} from '../../Scan/common/types'
import {asClaimApiError, asClaimToken} from './transformers'
import {ClaimApi, ClaimApiClaimTokensResponse} from './types'
import {ClaimTokensApiResponseSchema} from './validators'

type ClaimApiMakerOptions = Readonly<{
  address: string
  primaryTokenInfo: Portfolio.Token.Info
  tokenManager: Portfolio.Manager.Token
}>

export const claimApiMaker = (
  {address, primaryTokenInfo, tokenManager}: ClaimApiMakerOptions,
  deps: Readonly<{request: FetchData}> = {request: fetchData} as const,
): Readonly<ClaimApi> => {
  const claimTokens = postClaimTokens({address, primaryTokenInfo, tokenManager}, deps)

  return {
    claimTokens,
    address,
    primaryTokenInfo,
  } as const
}

const postClaimTokens =
  ({address, primaryTokenInfo, tokenManager}: ClaimApiMakerOptions, {request} = {request: fetchData}) =>
  async (claimAction: ScanActionClaim) => {
    // builds the request from the action, overides address and code
    const {code, params, url} = claimAction
    const payload = {...params, address, code}

    try {
      const response = await request<ClaimApiClaimTokensResponse>({
        url,
        method: 'post',
        data: payload,
      })

      if (isLeft(response)) {
        return asClaimApiError(response.error)
      } else {
        const claimInfo = response.value.data
        if (!ClaimTokensApiResponseSchema.safeParse(claimInfo).success) throw new Api.Errors.ResponseMalformed()

        return asClaimToken(claimInfo, primaryTokenInfo, tokenManager)
      }
    } catch (error) {
      throw new Api.Errors.Unknown((error as Error)?.message)
    }
  }
