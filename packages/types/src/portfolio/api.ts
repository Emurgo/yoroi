import {
  ApiRequestRecordWithCache,
  ApiResponseRecordWithCache,
} from '../api/cache'
import {ApiResponse} from '../api/response'
import {PortfolioTokenActivityUpdates} from './activity'
import {PortfolioTokenDiscovery} from './discovery'
import {PortfolioTokenInfo} from './info'
import {PortfolioTokenId} from './token'
import {PortfolioTokenTraits} from './traits'

export type PortfolioApiTokenDiscoveryResponse = PortfolioTokenDiscovery

export type PortfolioApiTokenInfosResponse = {
  [key: PortfolioTokenId]: ApiResponseRecordWithCache<PortfolioTokenInfo>
}

export type PortfolioApiTokenActivityUpdatesResponse = {
  [key: PortfolioTokenId]: PortfolioTokenActivityUpdates
}

export type PortfolioApiTokenTraitsResponse = PortfolioTokenTraits

export type PortfolioApi = Readonly<{
  tokenInfo(
    id: PortfolioTokenId,
  ): Promise<Readonly<ApiResponse<PortfolioTokenInfo>>>
  tokenInfos(
    idsWithETag: ReadonlyArray<ApiRequestRecordWithCache<PortfolioTokenId>>,
  ): Promise<Readonly<ApiResponse<PortfolioApiTokenInfosResponse>>>
  tokenDiscovery(
    id: PortfolioTokenId,
  ): Promise<Readonly<ApiResponse<PortfolioApiTokenDiscoveryResponse>>>
  tokenTraits(
    id: PortfolioTokenId,
  ): Promise<Readonly<ApiResponse<PortfolioTokenTraits>>>
  tokenActivityUpdates(
    ids: ReadonlyArray<PortfolioTokenId>,
  ): Promise<Readonly<ApiResponse<PortfolioApiTokenActivityUpdatesResponse>>>
}>
