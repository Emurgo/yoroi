/* eslint-disable @typescript-eslint/no-explicit-any */

export * from './assetUtils'

import {checkedFetch} from '../fetch'
import {BackendConfig} from '../types'
import {TokenInfoRequest, TokenInfoResponse} from './types'

export const getTokenInfo = async (request: TokenInfoRequest, config: BackendConfig): Promise<TokenInfoResponse> => {
  const {tokenIds} = request
  if (config.TOKEN_INFO_SERVICE == null) {
    throw new Error('Cardano wallets should have a Token metadata provider')
  }
  const endpointRoot = `${config.TOKEN_INFO_SERVICE}/metadata`
  const responses: Array<any> = await Promise.all(
    tokenIds.map(async (tokenId) => {
      try {
        return await checkedFetch({
          endpoint: `${endpointRoot}/${tokenId}`,
          method: 'GET',
          payload: undefined,
        })
      } catch (_e) {
        return {}
      }
    }),
  )
  return responses.reduce((res, resp) => {
    if (resp && resp.subject) {
      const v: {
        policyId: string
        assetName: string
      } & {
        name?: string
        decimals?: string
        longName?: string
        ticker?: string
      } = {
        policyId: resp.subject.slice(0, 56),
        assetName: resp.subject.slice(56),
      }

      if (resp.name?.value) {
        v.name = resp.name.value
      }

      if (resp.decimals?.value) {
        v.decimals = resp.decimals.value
      }

      if (resp.description?.value) {
        v.longName = resp.name.value
      }

      if (resp.ticker?.value) {
        v.ticker = resp.ticker.value
      }

      if (v.name || v.decimals) {
        res[resp.subject] = v
      }
    }

    return res
  }, {})
}
