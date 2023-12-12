/* istanbul ignore file */
import {paramsMockResponse} from './protocol-params.mocks'
import {CardanoApi} from '../../index'

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

const getFrontendFees = {
  success: () => Promise.resolve(paramsMockResponse),
  delayed: (timeout?: number) =>
    delayedResponse({data: paramsMockResponse, timeout}),
  empty: () => Promise.resolve({}),
  loading,
  error: {
    unknown: unknownError,
  },
}

export const mockCardanoApi: CardanoApi.api = {
  getProtocolParams: getFrontendFees.success,
} as const
