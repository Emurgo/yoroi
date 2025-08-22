// NOTE: to be moved into @emurgo/types Portfolio.Pairing
export type PortfolioCurrencySymbol =
  | 'ADA'
  | 'BRL'
  | 'BTC'
  | 'CNY'
  | 'ETH'
  | 'EUR'
  | 'JPY'
  | 'KRW'
  | 'USD'

export type PortfolioCurrencyConfig = {
  decimals: number
  nativeName: string
}

export type PortfolioCurrencyConfigBySymbol = {
  [K in PortfolioCurrencySymbol]: PortfolioCurrencyConfig
}
