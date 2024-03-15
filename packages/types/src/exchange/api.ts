import {AxiosRequestConfig} from 'axios'

export interface ExchangeApi {
  getBaseUrl({
    isProduction,
    partner,
    fetcherConfig,
  }: {
    isProduction: boolean
    partner?: string
    fetcherConfig?: AxiosRequestConfig
  }): Promise<string>
}
