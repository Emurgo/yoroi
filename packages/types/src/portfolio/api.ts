import {
  ApiRequestRecordWithCache,
  ApiResponseRecordWithCache,
} from '../api/cache'
import {ApiResponse} from '../api/response'
import {PortfolioTokenActivity, PortfolioTokenActivityWindow} from './activity'
import {PortfolioTokenDiscovery} from './discovery'
import {PortfolioTokenInfo} from './info'
import {PortfolioTokenId} from './token'
import {PortfolioTokenTraits} from './traits'

export type PortfolioApiTokenDiscoveryResponse = PortfolioTokenDiscovery

export type PortfolioApiTokenInfosResponse = {
  [key: PortfolioTokenId]: ApiResponseRecordWithCache<PortfolioTokenInfo>
}

export type PortfolioApiTokenActivityResponse = {
  [key: PortfolioTokenId]: PortfolioTokenActivity
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
  tokenActivity(
    ids: ReadonlyArray<PortfolioTokenId>,
    window: PortfolioTokenActivityWindow,
  ): Promise<Readonly<ApiResponse<PortfolioApiTokenActivityResponse>>>
  tokenImageInvalidate(
    ids: ReadonlyArray<PortfolioTokenId>,
  ): Promise<Array<{code: string; message: string}>>
}>
