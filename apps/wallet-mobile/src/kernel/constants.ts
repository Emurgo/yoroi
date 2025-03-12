import {freeze} from 'immer'

export const supportedThemes = freeze({
  system: 'system',
  'default-light': 'default-light',
  'default-dark': 'default-dark',
})

// NOTE: to be moved into pairing module once it's implemented
export const supportedCurrencies = freeze({
  ADA: 'ADA',
  BRL: 'BRL',
  BTC: 'BTC',
  CNY: 'CNY',
  ETH: 'ETH',
  EUR: 'EUR',
  JPY: 'JPY',
  KRW: 'KRW',
  USD: 'USD',
} as const)

export const configCurrencies = freeze({
  [supportedCurrencies.ADA]: {
    decimals: 6,
    nativeName: 'Cardano',
  },
  [supportedCurrencies.BRL]: {
    decimals: 2,
    nativeName: 'Real',
  },
  [supportedCurrencies.BTC]: {
    decimals: 8,
    nativeName: 'Bitcoin',
  },
  [supportedCurrencies.CNY]: {
    decimals: 2,
    nativeName: '人民币',
  },
  [supportedCurrencies.ETH]: {
    decimals: 8,
    nativeName: 'Ethereum',
  },
  [supportedCurrencies.EUR]: {
    decimals: 2,
    nativeName: 'Euro',
  },
  [supportedCurrencies.JPY]: {
    decimals: 2,
    nativeName: '日本円',
  },
  [supportedCurrencies.KRW]: {
    decimals: 2,
    nativeName: '대한민국 원',
  },
  [supportedCurrencies.USD]: {
    decimals: 2,
    nativeName: 'US Dollar',
  },
})

// NOTE: bech32 'drep1ygr9tuapcanc3kpeyy4dc3vmrz9cfe5q7v9wj3x9j0ap3tswtre9j'
export const yoroiDRepIdHex = '220655f3a1c76788d839212adc459b188b84e680f30ae944c593fa18ae'
