import {AppFrontendFeesResponse} from './frontend-fees'

export interface AppApi {
  getFrontendFees(): Promise<AppFrontendFeesResponse>
}
