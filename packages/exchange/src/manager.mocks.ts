import {freeze} from 'immer'

import {providers} from './adapters/api'
import {ExchangeManager} from './manager'

const loading = () => new Promise(() => {})
const unknownError = () => Promise.reject(new Error('Unknown error'))
const delayedResponse = <T = never>({
  data,
  timeout = 3000,
}: {
  data: T
  timeout?: number
}) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(data), timeout)
  })

const providerListByFeature = {
  success: () => Promise.resolve(Object.entries(providers)),
  delayed: (timeout?: number) =>
    delayedResponse({data: Object.entries(providers), timeout}),
  empty: () => Promise.resolve(),
  loading,
  error: {
    unknown: unknownError,
  },
}

const referralLinkCreate = {
  success: () => Promise.resolve(),
  delayed: (timeout?: number) => delayedResponse({data: '', timeout}),
  empty: () => Promise.resolve([]),
  loading,
  error: {
    unknown: unknownError,
  },
}

const success: ExchangeManager = {
  provider: {
    suggested: {
      // TODO: fix add a constant for now
      byOrderType: () =>
        ({
          ['sell']: 'banxa',
          ['buy']: 'banxa',
        } as {[key in 'sell' | 'buy']: string}),
    },
    list: {
      byOrderType: providerListByFeature.success,
    },
  },
  referralLink: {
    create: referralLinkCreate.success,
  },
}

const error: ExchangeManager = {
  provider: {
    list: {
      byOrderType: providerListByFeature.error.unknown,
    },
  },
  referralLink: {
    create: referralLinkCreate.error.unknown,
  },
}

export const managerMocks: Readonly<Record<string, ExchangeManager>> = freeze(
  {
    success,
    error,
  },
  true,
)
