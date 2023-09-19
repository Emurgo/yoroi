export type PortfolioTokenPrice = Readonly<{
  volume: {
    base: string // float, trading volume 24h in base currency (e.g. ADA).
    quote: string // float, trading volume 24h in quote currency.
  }
  volumeChange: {
    base: number // float, percent change of trading volume in comparison to previous 24h.
    quote: number // float, percent change of trading volume in comparison to previous 24h.
  }
  price: number // live trading price in base currency (e.g. ADA).
  askPrice: number // lowest ask price in base currency (e.g. ADA).
  bidPrice: number // highest bid price in base currency (e.g. ADA).
  priceChange: {
    '24h': string // float, price change last 24 hours.
    '7d': string // float, price change last 7 days.
  }
  quoteDecimalPlaces: number // decimal places of quote token.
  baseDecimalPlaces: number // decimal places of base token.
  price10d: number[] //float, prices of this tokens averaged for the last 10 days, in chronological order i.e.oldest first.
}>
