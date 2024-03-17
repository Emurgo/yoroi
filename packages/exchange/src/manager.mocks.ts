import {freeze} from 'immer'
import {Exchange} from '@yoroi/types'

import {providers} from './adapters/api'

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
  success: () => Promise.resolve(new URL('https://google.com')),
  delayed: (timeout?: number) => delayedResponse({data: '', timeout}),
  empty: () => Promise.resolve([]),
  loading,
  error: {
    unknown: unknownError,
  },
}

export const successManagerMock: Exchange.Manager = {
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

export const errorManagerMock: Exchange.Manager = {
  provider: {
    list: {
      byOrderType: providerListByFeature.error.unknown,
    },
    suggested: {
      byOrderType: () => ({
        ['sell']: '',
        ['buy']: '',
      }),
    },
  },
  referralLink: {
    create: referralLinkCreate.error.unknown,
  },
}

export const managerMocks: Readonly<Record<string, Exchange.Manager>> = freeze(
  {
    success: successManagerMock,
    error: errorManagerMock,
  },
  true,
)
