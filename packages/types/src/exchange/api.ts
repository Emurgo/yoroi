import {AxiosRequestConfig} from 'axios'

import {ExchangeProvider} from './provider'
import {ExchangeReferralUrlQueryStringParams} from './query-string'

export interface ExchangeApi {
  getBaseUrl(
    providerId: string,
    fetcherOptions?: AxiosRequestConfig,
  ): Promise<string>
  getProviders(): Promise<Record<string, ExchangeProvider>>

  extractParamsFromBaseUrl?(
    providerId: string,
    baseUrl: string,
  ): Partial<ExchangeReferralUrlQueryStringParams>
}
