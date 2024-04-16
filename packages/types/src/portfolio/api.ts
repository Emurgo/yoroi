import {
  ApiRequestRecordWithCache,
  ApiResponseRecordWithCache,
} from '../api/cache'
import {ApiResponse} from '../api/response'
import {PortfolioTokenDiscovery} from './discovery'
import {PortfolioTokenInfo} from './info'
import {PortfolioTokenId} from './token'

export type PortfolioApiTokenDiscoveriesResponse = {
  [key: PortfolioTokenId]: ApiResponseRecordWithCache<PortfolioTokenDiscovery>
}

export type PortfolioApiTokenInfosResponse = {
  [key: PortfolioTokenId]: ApiResponseRecordWithCache<PortfolioTokenInfo>
}

export type PortfolioApi = Readonly<{
  tokenInfos(
    idsWithETag: ReadonlyArray<ApiRequestRecordWithCache<PortfolioTokenId>>,
  ): Promise<Readonly<ApiResponse<PortfolioApiTokenInfosResponse>>>
  tokenDiscoveries(
    idsWithETag: ReadonlyArray<ApiRequestRecordWithCache<PortfolioTokenId>>,
  ): Promise<Readonly<ApiResponse<PortfolioApiTokenDiscoveriesResponse>>>
}>
