import {
  ApiRequestRecordWithCache,
  ApiResponseRecordWithCache,
} from '../api/cache'
import {ApiResponse} from '../api/response'
import {PortfolioTokenDiscovery} from './discovery'
import {PortfolioTokenInfo} from './info'
import {PortfolioTokenId} from './token'
import {PortfolioTokenTraits} from './traits'

export type PortfolioApiTokenDiscoveryResponse = PortfolioTokenDiscovery

export type PortfolioApiTokenInfosResponse = {
  [key: PortfolioTokenId]: ApiResponseRecordWithCache<PortfolioTokenInfo>
}

export type PortfolioApiTokenTraitsResponse = PortfolioTokenTraits

export type PortfolioApi = Readonly<{
  tokenInfos(
    idsWithETag: ReadonlyArray<ApiRequestRecordWithCache<PortfolioTokenId>>,
  ): Promise<Readonly<ApiResponse<PortfolioApiTokenInfosResponse>>>
  tokenDiscovery(
    id: PortfolioTokenId,
  ): Promise<Readonly<ApiResponse<PortfolioApiTokenDiscoveryResponse>>>
  tokenTraits(
    id: PortfolioTokenId,
  ): Promise<Readonly<ApiResponse<PortfolioTokenTraits>>>
}>
