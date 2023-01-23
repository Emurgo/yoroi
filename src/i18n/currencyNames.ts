import {defineMessages} from 'react-intl'

import {supportedCurrencies} from '../yoroi-wallets'

export const currencyNames = defineMessages({
  [supportedCurrencies.ADA]: {
    id: 'global.currency.ADA',
    defaultMessage: `!!!ADA`,
  },
  [supportedCurrencies.BRL]: {
    id: 'global.currency.BRL',
    defaultMessage: `!!!BRL`,
  },
  [supportedCurrencies.BTC]: {
    id: 'global.currency.BTC',
    defaultMessage: `!!!BTC`,
  },
  [supportedCurrencies.CNY]: {
    id: 'global.currency.CNY',
    defaultMessage: `!!!CNY`,
  },
  [supportedCurrencies.ETH]: {
    id: 'global.currency.ETH',
    defaultMessage: `!!!ETH`,
  },
  [supportedCurrencies.EUR]: {
    id: 'global.currency.EUR',
    defaultMessage: `!!!EUR`,
  },
  [supportedCurrencies.JPY]: {
    id: 'global.currency.JPY',
    defaultMessage: `!!!JPY`,
  },
  [supportedCurrencies.KRW]: {
    id: 'global.currency.KRW',
    defaultMessage: `!!!KRW`,
  },
  [supportedCurrencies.USD]: {
    id: 'global.currency.USD',
    defaultMessage: `!!!USD`,
  },
})
