/* istanbul ignore file */
import {Api} from '@yoroi/types'
import {paramsMockResponse} from './protocol-params.mocks'

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

const getProtocolParams = {
  success: () => Promise.resolve(paramsMockResponse),
  delayed: (timeout?: number) =>
    delayedResponse({data: paramsMockResponse, timeout}),
  empty: () => Promise.resolve({}),
  loading,
  error: {
    unknown: unknownError,
  },
}

export const mockCardanoApi: Api.Cardano.Api = {
  getProtocolParams: getProtocolParams.success,
} as const
