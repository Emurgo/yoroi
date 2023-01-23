import {ApiError} from '../errors'
import fetchDefault from '../fetch'
import {BackendConfig} from '../types'
import {supportedCurrencies} from './currencies'

export const fetchCurrentPrice = async (currency: CurrencySymbol, config: BackendConfig): Promise<number> => {
  const response = (await fetchDefault('price/ADA/current', null, config, 'GET')) as unknown as PriceResponse

  if (response.error) throw new ApiError(response.error)

  return response.ticker.prices[currency]
}

export type CurrencySymbol = keyof typeof supportedCurrencies

export type PriceResponse = {
  error: string | null
  ticker: {
    from: 'ADA' // we don't support ERG yet
    timestamp: number
    signature: string
    prices: Record<CurrencySymbol, number>
  }
}
