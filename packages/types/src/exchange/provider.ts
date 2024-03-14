export enum ExchangeProvider {
  Banxa = 'banxa',
  Encryptus = 'encryptus',
}

export type ExchangeProviderFeatures = {
  sell?: {
    fee: number
    max: number
    min: number
  }
  buy?: {
    fee: number
    max: number
    min: number
  }
}

export type ExchangeProviders = Record<
  ExchangeProvider,
  ExchangeProviderFeatures
>
