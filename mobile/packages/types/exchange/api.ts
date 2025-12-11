import {AxiosRequestConfig} from 'axios'

import {ExchangeProvider} from './provider'

export type ExchangeApi = {
  getBaseUrl(
    providerId: string,
    fetcherOptions?: AxiosRequestConfig,
  ): Promise<string>
  getProviders(): Promise<Record<string, ExchangeProvider>>
}
