import {Portfolio} from '@yoroi/types'

import {freeze} from 'immer'

export const primaryTokenId = '.'

export const configCurrencies: Readonly<Portfolio.Currency.ConfigBySymbol> =
  freeze(
    {
      ADA: {
        decimals: 6,
        nativeName: 'Cardano',
      },
      BRL: {
        decimals: 2,
        nativeName: 'Real',
      },
      BTC: {
        decimals: 8,
        nativeName: 'Bitcoin',
      },
      CNY: {
        decimals: 2,
        nativeName: '人民币',
      },
      ETH: {
        decimals: 8,
        nativeName: 'Ethereum',
      },
      EUR: {
        decimals: 2,
        nativeName: 'Euro',
      },
      JPY: {
        decimals: 2,
        nativeName: '日本円',
      },
      KRW: {
        decimals: 2,
        nativeName: '대한민국 원',
      },
      USD: {
        decimals: 2,
        nativeName: 'US Dollar',
      },
    } as const,
    true,
  )
