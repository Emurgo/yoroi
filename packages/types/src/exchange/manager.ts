import {AxiosRequestConfig} from 'axios'

import {ExchangeOrderType} from './order-type'
import {ExchangeProvider} from './provider'
import {ExchangeReferralUrlQueryStringParams} from './query-string'

export type ExchangeManager = Readonly<{
  provider: {
    suggested: {
      byOrderType: () => Readonly<Record<ExchangeOrderType, string>>
    }
    list: {
      byOrderType: (
        orderType: ExchangeOrderType,
      ) => Promise<ReadonlyArray<[string, ExchangeProvider]>>
    }
  }
  referralLink: {
    create: (
      {
        providerId,
        queries,
      }: {
        providerId: string
        queries: ExchangeReferralUrlQueryStringParams
      },
      fetcherOptions?: AxiosRequestConfig,
    ) => Promise<URL>
  }
}>
