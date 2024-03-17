import {AxiosRequestConfig} from 'axios'

import {ExchangeProvider} from './provider'

export interface ExchangeApi {
  getBaseUrl(
    providerId: string,
    fetcherOptions?: AxiosRequestConfig,
  ): Promise<string>
  getProviders(): Promise<Record<string, ExchangeProvider>>
}
