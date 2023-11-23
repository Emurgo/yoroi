import {AppFrontendFeesResponse} from './frontend-fees'
import {AppProtocolParamsResponse} from './protocol-params'

export interface AppApi {
  getFrontendFees(): Promise<AppFrontendFeesResponse>
  getProtocolParams(): Promise<AppProtocolParamsResponse>
}
